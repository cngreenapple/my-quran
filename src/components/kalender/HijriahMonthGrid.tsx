import { useMemo } from "react";
import {
  getHijriMonthInfo,
} from "@/lib/kalender-helpers";
import { getHolidayOnDate } from "@/data/islamic-holidays";
import type { IslamicHoliday } from "@/data/islamic-holidays";
import { DayCell, EmptyDayCell } from "./DayCell";
import { WeekdayRow } from "./WeekdayRow";
import { HIJRI_MONTH_NAMES_ID } from "./constants";

interface HijriahMonthGridProps {
  hijriYear: number;
  hijriMonth: number;
  todayHijri: { year: number; month: number; day: number };
}

export function HijriahMonthGrid({
  hijriYear,
  hijriMonth,
  todayHijri,
}: HijriahMonthGridProps) {
  const info = useMemo(
    () => getHijriMonthInfo(hijriYear, hijriMonth),
    [hijriYear, hijriMonth],
  );

  const cells = useMemo(() => {
    const arr: Array<{ day: number; isToday: boolean; holiday?: IslamicHoliday }> = [];
    for (let i = 0; i < info.startWeekday; i++) {
      // Placeholder handled in render
      arr.push({ day: 0, isToday: false });
    }
    for (let d = 1; d <= info.daysInMonth; d++) {
      const holiday = getHolidayOnDate(hijriMonth, d);
      const isToday =
        hijriYear === todayHijri.year &&
        hijriMonth === todayHijri.month &&
        d === todayHijri.day;
      arr.push({ day: d, isToday, holiday });
    }
    return arr;
  }, [info, hijriYear, hijriMonth, todayHijri]);

  const context = `${HIJRI_MONTH_NAMES_ID[hijriMonth]} ${hijriYear} H`;

  return (
    <div>
      <WeekdayRow />
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={context}>
        {cells.map((cell, idx) =>
          cell.day === 0 ? (
            <EmptyDayCell key={idx} />
          ) : (
            <DayCell
              key={idx}
              day={cell.day}
              isToday={cell.isToday}
              holiday={cell.holiday}
              calendarSystem="hijriah"
              context={context}
            />
          ),
        )}
      </div>
    </div>
  );
}