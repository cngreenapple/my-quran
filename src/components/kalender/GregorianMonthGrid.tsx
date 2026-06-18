import { useMemo } from "react";
import {
  gregorianMonthInfo,
  gregorianToJDN,
  jdnToHijri,
} from "@/lib/date";
import { getHolidayOnDate } from "@/data/islamic-holidays";
import type { IslamicHoliday } from "@/data/islamic-holidays";
import { DayCell, EmptyDayCell } from "./DayCell";
import { WeekdayRow } from "./WeekdayRow";

interface GregorianMonthGridProps {
  gregYear: number;
  /** 0-indexed (Jan=0, Dec=11) — JS Date convention */
  gregMonth: number;
  todayGreg: { year: number; month: number; day: number };
  monthName: string;
}

export function GregorianMonthGrid({
  gregYear,
  gregMonth,
  todayGreg,
  monthName,
}: GregorianMonthGridProps) {
  const info = useMemo(
    () => gregorianMonthInfo(gregYear, gregMonth),
    [gregYear, gregMonth],
  );

  const cells = useMemo(() => {
    const arr: Array<{
      day: number;
      isToday: boolean;
      holiday?: IslamicHoliday;
    }> = [];
    for (let i = 0; i < info.startWeekday; i++) {
      arr.push({ day: 0, isToday: false });
    }
    for (let d = 1; d <= info.daysInMonth; d++) {
      const jdn = gregorianToJDN(gregYear, gregMonth + 1, d);
      const h = jdnToHijri(jdn);
      const holiday = getHolidayOnDate(h.month, h.day);
      const isToday =
        gregYear === todayGreg.year &&
        gregMonth + 1 === todayGreg.month &&
        d === todayGreg.day;
      arr.push({ day: d, isToday, holiday });
    }
    return arr;
  }, [info, gregYear, gregMonth, todayGreg]);

  const context = `${d} ${monthName} ${gregYear}`.replace("d", "");
  const label = `${monthName} ${gregYear}`;

  return (
    <div>
      <WeekdayRow />
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={label}>
        {cells.map((cell, idx) =>
          cell.day === 0 ? (
            <EmptyDayCell key={idx} />
          ) : (
            <DayCell
              key={idx}
              day={cell.day}
              isToday={cell.isToday}
              holiday={cell.holiday}
              calendarSystem="masehi"
              context={context}
            />
          ),
        )}
      </div>
    </div>
  );
}