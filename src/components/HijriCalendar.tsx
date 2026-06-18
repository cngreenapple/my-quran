import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarDay } from "@/types/hijri-calendar";

interface HijriCalendarProps {
  year: number;
  month: number; // 0-indexed
  days: CalendarDay[];
  onPrev: () => void;
  onNext: () => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const WEEKDAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const holidayColorMap = {
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-amber-500/30",
  rose: "bg-rose-500/15 text-rose-700 dark:text-rose-400 ring-rose-500/30",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-400 ring-sky-500/30",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-400 ring-violet-500/30",
};

const puasaColorMap = {
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/40",
  sky: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/40",
  rose: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/40",
  violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/40",
};

export function HijriCalendar({
  year,
  month,
  days,
  onPrev,
  onNext,
}: HijriCalendarProps) {
  // Build empty cells for start of month
  const firstDayOfWeek = useMemo(() => {
    if (days.length === 0) return 0;
    return new Date(year, month, 1).getDay();
  }, [year, month, days.length]);

  const cells: (CalendarDay | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...days,
  ];

  // Pad to make it 6 weeks (42 cells)
  while (cells.length < 42) cells.push(null);

  // Determine current Hijri month range for header.
  // Pakai majority vote: bulan Hijriah yang paling banyak muncul di bulan Masehi ini.
  const hijriMonthInfo = useMemo(() => {
    if (days.length === 0) return { name: "", year: 0 };
    const monthCounts: Record<number, number> = {};
    const yearByMonth: Record<number, Set<number>> = {};
    for (const d of days) {
      monthCounts[d.hijri.month] = (monthCounts[d.hijri.month] || 0) + 1;
      if (!yearByMonth[d.hijri.month]) yearByMonth[d.hijri.month] = new Set();
      yearByMonth[d.hijri.month].add(d.hijri.year);
    }
    let majorityMonth = days[0].hijri.month;
    let maxCount = 0;
    for (const [m, c] of Object.entries(monthCounts)) {
      if (c > maxCount) {
        maxCount = c;
        majorityMonth = Number(m);
      }
    }
    const years = yearByMonth[majorityMonth] || new Set();
    const year = years.size > 0 ? Array.from(years).sort()[0] : 0;
    return { month: majorityMonth, year };
  }, [days]);

  const currentHijriMonthName = useMemo(() => {
    const HIJRI_MONTH_NAMES = [
      "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
      "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
      "Ramadan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
    ];
    return HIJRI_MONTH_NAMES[hijriMonthInfo.month - 1] || "";
  }, [hijriMonthInfo.month]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          className="rounded-full"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">
            {MONTH_NAMES[month]} {year}
          </h2>
          {currentHijriMonthName && (
            <p className="text-xs text-muted-foreground">
              {currentHijriMonthName} {hijriMonthInfo.year} H
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="rounded-full"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS_SHORT.map((wd) => (
          <div
            key={wd}
            className={cn(
              "text-center text-[10px] font-bold uppercase tracking-wider py-1.5",
              wd === "Jum" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
            )}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const isFirstOfHijriMonth = day.hijri.day === 1;
          const hasHoliday = day.holidays.length > 0;
          const hasPuasa = day.puasaSunnah.length > 0;
          const holidayColor = hasHoliday ? day.holidays[0].color : null;
          const puasaColor = hasPuasa ? day.puasaSunnah[0].color : null;

          // Determine background style - priority: today > holiday > puasa > jumat > weekend > default
          let bgClass = "";
          if (day.isToday) {
            bgClass = "bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/40";
          } else if (hasHoliday && holidayColor) {
            bgClass = cn(holidayColorMap[holidayColor], "ring-1");
          } else if (hasPuasa && puasaColor) {
            bgClass = cn(puasaColorMap[puasaColor], "ring-1 ring-current/30");
          } else if (day.isJumat) {
            bgClass = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400";
          } else if (day.isWeekend) {
            bgClass = "bg-muted/40 text-muted-foreground";
          } else {
            bgClass = "bg-card border border-border/40";
          }

          return (
            <div
              key={day.gregorian.date.toISOString()}
              className={cn(
                "relative aspect-square rounded-xl p-1 flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer",
                bgClass,
              )}
              title={
                [
                  hasHoliday && `🎉 ${day.holidays[0].name}`,
                  ...day.puasaSunnah.map((p) => `${p.emoji} ${p.title}${p.note ? ` (${p.note})` : ""}`),
                ].filter(Boolean).join("\n") || undefined
              }
            >
              <span
                className={cn(
                  "text-sm font-bold leading-none tabular-nums",
                  day.isToday && "text-base",
                )}
              >
                {day.gregorian.day}
              </span>
              <span
                className={cn(
                  "text-[9px] leading-none mt-0.5 tabular-nums",
                  day.isToday
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground",
                )}
              >
                {day.hijri.day}
              </span>
              {/* Markers stack di pojok kanan atas */}
              {(hasHoliday || hasPuasa) && (
                <div className="absolute top-0.5 right-0.5 flex flex-col items-end gap-0.5">
                  {hasHoliday && (
                    <span className="text-[10px] leading-none">
                      {day.holidays[0].emoji}
                    </span>
                  )}
                  {hasPuasa && (
                    <span className="text-[9px] leading-none opacity-90">
                      {day.puasaSunnah[0].emoji}
                    </span>
                  )}
                  {day.puasaSunnah.length > 1 && (
                    <span className="text-[7px] leading-none font-bold opacity-75">
                      +{day.puasaSunnah.length - 1}
                    </span>
                  )}
                </div>
              )}
              {isFirstOfHijriMonth && !hasHoliday && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}