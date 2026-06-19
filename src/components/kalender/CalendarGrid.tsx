import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getTodayInfo,
  GREGORIAN_MONTH_NAMES,
  gregorianToJDN,
  jdnToHijri,
} from "@/lib/date";
import { gregorianMonthInfo, getHijriMonthInfo } from "@/lib/kalender-helpers";
import {
  ISLAMIC_HOLIDAYS,
  type IslamicHoliday,
  getHolidayOnDate,
} from "@/data/islamic-holidays";
import { colorClasses } from "./constants";
import { CalendarHeader } from "./CalendarHeader";
import { WeekdayRow } from "./WeekdayRow";

/**
 * CalendarGrid: kalender kombinasi Hijriah + Masehi dalam 1 grid.
 *
 * Tiap cell menampilkan DUA angka:
 *   - Hijriah: angka kecil di atas (primary color)
 *   - Masehi: angka utama di bawah (bold)
 *
 * Ini adalah layout paling informatif untuk kalender Islam —
 * user bisa langsung lihat posisi tanggal Hijriah dari tanggal Masehi
 * (atau sebaliknya) tanpa perlu navigasi terpisah.
 */
interface CalendarGridProps {
  today?: ReturnType<typeof getTodayInfo>;
}

export function CalendarGrid({ today: todayProp }: CalendarGridProps) {
  const today = useMemo(() => todayProp ?? getTodayInfo(), [todayProp]);

  // Navigation state — selalu sinkron antara Hijriah & Masehi
  // (user navigasi 1 bulan → kedua kalender ikut)
  const [hijriYear, setHijriYear] = useState(today.hijri.year);
  const [hijriMonth, setHijriMonth] = useState(today.hijri.month);
  const [gregYear, setGregYear] = useState(today.gregorian.year);
  const [gregMonth, setGregMonth] = useState(today.gregorian.month - 1); // 0-indexed

  // Computed info
  const hijriInfo = useMemo(
    () => getHijriMonthInfo(hijriYear, hijriMonth),
    [hijriYear, hijriMonth],
  );
  const gregInfo = useMemo(
    () => gregorianMonthInfo(gregYear, gregMonth),
    [gregYear, gregMonth],
  );

  /**
   * Build cells dengan alignment aligned to BOTH calendars.
   * Approach: align by first day of the Masehi month, lalu untuk
   * setiap tanggal Masehi hitung tanggal Hijriah-nya.
   *
   * Note: bulan Hijriah tidak selalu match dengan bulan Masehi.
   * Tanggal Hijriah bisa overflow ke bulan sebelumnya/berikutnya —
   * kita tampilkan apa adanya.
   */
  const cells = useMemo(() => {
    const arr: Array<{
      gregDay: number;
      hijriDay: number;
      isToday: boolean;
      holiday?: IslamicHoliday;
    }> = [];
    for (let i = 0; i < gregInfo.startWeekday; i++) {
      arr.push({ gregDay: 0, hijriDay: 0, isToday: false });
    }
    for (let d = 1; d <= gregInfo.daysInMonth; d++) {
      const jdn = gregorianToJDN(gregYear, gregMonth + 1, d);
      const h = jdnToHijri(jdn);
      const holiday = getHolidayOnDate(h.month, h.day);
      const isToday =
        gregYear === today.gregorian.year &&
        gregMonth + 1 === today.gregorian.month &&
        d === today.gregorian.day;
      arr.push({ gregDay: d, hijriDay: h.day, isToday, holiday });
    }
    return arr;
  }, [gregInfo, gregYear, gregMonth, today]);

  const goPrev = () => {
    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear(hijriYear - 1);
    } else {
      setHijriMonth(hijriMonth - 1);
    }
    if (gregMonth === 0) {
      setGregMonth(11);
      setGregYear(gregYear - 1);
    } else {
      setGregMonth(gregMonth - 1);
    }
  };

  const goNext = () => {
    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear(hijriYear + 1);
    } else {
      setHijriMonth(hijriMonth + 1);
    }
    if (gregMonth === 11) {
      setGregMonth(0);
      setGregYear(gregYear + 1);
    } else {
      setGregMonth(gregMonth + 1);
    }
  };

  const goToday = () => {
    setHijriYear(today.hijri.year);
    setHijriMonth(today.hijri.month);
    setGregYear(today.gregorian.year);
    setGregMonth(today.gregorian.month - 1);
  };

  const hijriMonthNames = [
    "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
    "Jumadil Awal", "Jumadil Akhir", "Rajab", "Syaban",
    "Ramadan", "Syawal", "Dzulka'dah", "Dzulhijjah",
  ];

  const title = `${GREGORIAN_MONTH_NAMES[gregMonth]} ${gregYear}`;

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardContent className="p-3.5">
        {/* Title — both Hijriah & Masehi */}
        <CalendarHeader
          subtitle="🌙📅 Hijriah & Masehi"
          subtitleClassName="text-violet-600 dark:text-violet-400"
          title={title}
          onPrev={goPrev}
          onNext={goNext}
        />

        {/* Subtitle with Hijri month */}
        <div className="text-center mb-3 -mt-1.5">
          <p className="text-[11px] text-muted-foreground font-medium">
            {hijriMonthNames[hijriMonth - 1]} {hijriYear} H
          </p>
        </div>

        <WeekdayRow />

        {/* Combined grid — both numbers per cell */}
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label={title}>
          {cells.map((cell, idx) => {
            if (cell.gregDay === 0) return <div key={idx} aria-hidden="true" />;
            const c = cell.holiday ? colorClasses[cell.holiday.color] : null;
            const isTodayStyle = cell.isToday;
            const baseClass = cn(
              "relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all",
              isTodayStyle
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : c
                ? `${c.text} ${c.emojiBg} ring-1 ${c.ring}`
                : "text-foreground hover:bg-muted",
            );

            return (
              <div
                key={idx}
                className={baseClass}
                role="gridcell"
                aria-label={
                  cell.holiday
                    ? `${cell.gregDay} ${GREGORIAN_MONTH_NAMES[gregMonth]} ${gregYear} / ${cell.hijriDay} ${hijriMonthNames[hijriMonth - 1]} - ${cell.holiday.name}`
                    : `${cell.gregDay} ${GREGORIAN_MONTH_NAMES[gregMonth]} ${gregYear} / ${cell.hijriDay} ${hijriMonthNames[hijriMonth - 1]}`
                }
                title={cell.holiday?.name}
              >
                {/* Hijriah number (small, top) */}
                <span
                  className={cn(
                    "tabular-nums leading-none text-[9px] font-medium",
                    isTodayStyle
                      ? "text-primary-foreground/80"
                      : c
                      ? c.text
                      : "text-muted-foreground",
                  )}
                >
                  {cell.hijriDay}
                </span>

                {/* Masehi number (primary, bottom) */}
                <span
                  className={cn(
                    "tabular-nums leading-none text-sm font-bold",
                    isTodayStyle
                      ? "text-primary-foreground"
                      : c
                      ? c.text
                      : "text-foreground",
                  )}
                >
                  {cell.gregDay}
                </span>

                {/* Holiday emoji (bottom-right corner) */}
                {cell.holiday && (
                  <span
                    className="absolute bottom-0.5 right-1 text-[7px] leading-none"
                    aria-hidden="true"
                  >
                    {cell.holiday.emoji}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Today button */}
        <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          <button
            onClick={goToday}
            className="text-[10px] text-primary font-semibold hover:underline px-2 py-1 rounded-md hover:bg-muted"
          >
            📍 Kembali ke hari ini
          </button>
          <p className="text-[10px] text-muted-foreground">
            {cells.filter((c) => c.gregDay > 0).length} hari • {cells.filter((c) => c.holiday).length} hari besar
          </p>
        </div>

        {/* Mini-legend */}
        <div className="mt-2.5 flex flex-wrap gap-x-2.5 gap-y-1">
          {ISLAMIC_HOLIDAYS.slice(0, 5).map((h) => {
            const c = colorClasses[h.color];
            return (
              <div key={h.id} className="flex items-center gap-1">
                <span className={cn("w-2 h-2 rounded shrink-0", c.dot)} />
                <span className="text-[9px] text-foreground/70 font-medium whitespace-nowrap">
                  {h.emoji} {h.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}