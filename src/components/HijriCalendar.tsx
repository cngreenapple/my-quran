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

// Holiday color schemes (background + text)
const holidayStyleMap: Record<
  string,
  { bg: string; text: string; ring: string }
> = {
  emerald: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-500/40",
  },
  amber: {
    bg: "bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500/40",
  },
  rose: {
    bg: "bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-500/40",
  },
  sky: {
    bg: "bg-sky-500/15",
    text: "text-sky-700 dark:text-sky-300",
    ring: "ring-sky-500/40",
  },
  violet: {
    bg: "bg-violet-500/15",
    text: "text-violet-700 dark:text-violet-300",
    ring: "ring-violet-500/40",
  },
};

// Puasa accent bar colors (vertical bar on left side of cell)
const puasaBarMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
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

  // Pad to make it 6 weeks (42 cells) supaya tinggi grid konsisten
  while (cells.length < 42) cells.push(null);

  // Determine current Hijri month range for header.
  // Pakai majority vote: bulan Hijriah yang paling banyak muncul di bulan Masehi ini.
  const hijriMonthInfo = useMemo(() => {
    if (days.length === 0) return { month: 1, year: 0 };
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
    const hijriYear = years.size > 0 ? Array.from(years).sort()[0] : 0;
    return { month: majorityMonth, year: hijriYear };
  }, [days]);

  const HIJRI_MONTH_NAMES = [
    "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
    "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
    "Ramadan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
  ];
  const currentHijriMonthName = HIJRI_MONTH_NAMES[hijriMonthInfo.month - 1] || "";

  return (
    <div>
      {/* Header - Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          className="rounded-full hover:bg-muted"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center px-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
            {MONTH_NAMES[month]} {year}
          </h2>
          {currentHijriMonthName && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              {currentHijriMonthName} {hijriMonthInfo.year} H
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="rounded-full hover:bg-muted"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
        {WEEKDAYS_SHORT.map((wd) => (
          <div
            key={wd}
            className={cn(
              "text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1.5",
              wd === "Jum"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground",
            )}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((day, i) => {
          if (!day) {
            return (
              <div
                key={`empty-${i}`}
                className="min-h-[68px] sm:min-h-[80px]"
                aria-hidden="true"
              />
            );
          }

          const hasHoliday = day.holidays.length > 0;
          const hasPuasa = day.puasaSunnah.length > 0;
          const holidayColor = hasHoliday ? day.holidays[0].color : null;
          const puasaColor = hasPuasa ? day.puasaSunnah[0].color : null;

          // Background style — priority: today > holiday > jumat > weekend > default
          // Text color di-set di cell supaya children inherit (untuk ring-current)
          let containerClass = "";
          if (day.isToday) {
            containerClass = cn(
              "bg-gradient-to-br from-primary to-emerald-700",
              "shadow-md shadow-primary/30 ring-2 ring-primary/50",
              "text-primary-foreground",
            );
          } else if (hasHoliday && holidayColor) {
            const style = holidayStyleMap[holidayColor];
            containerClass = cn(style.bg, style.text, "ring-1", style.ring);
          } else if (day.isJumat) {
            containerClass = cn(
              "bg-emerald-50/70 dark:bg-emerald-950/25",
              "text-foreground",
            );
          } else if (day.isWeekend) {
            containerClass = cn("bg-muted/40 text-muted-foreground");
          } else {
            containerClass = cn(
              "bg-card border border-border/40 text-foreground",
            );
          }

          // Tooltip text — tampil saat hover (desktop) via title attr
          const tooltip = [
            hasHoliday && `🎉 ${day.holidays[0].name}`,
            ...day.puasaSunnah.map(
              (p) => `${p.emoji} ${p.title}${p.note ? ` (${p.note})` : ""}`,
            ),
          ]
            .filter(Boolean)
            .join("\n");

          return (
            <div
              key={day.gregorian.date.toISOString()}
              className={cn(
                "relative min-h-[68px] sm:min-h-[80px] rounded-xl",
                "flex flex-col items-center justify-center",
                "cursor-pointer transition-all duration-150",
                "hover:scale-[1.04] hover:shadow-sm active:scale-[0.97]",
                containerClass,
              )}
              title={tooltip || undefined}
              aria-label={
                [
                  `${day.gregorian.weekday}, ${day.gregorian.day} ${MONTH_NAMES[day.gregorian.month - 1]} ${day.gregorian.year}`,
                  ` ${day.hijri.day} ${HIJRI_MONTH_NAMES[day.hijri.month - 1]} ${day.hijri.year} H`,
                  hasHoliday && ` — ${day.holidays[0].name}`,
                  hasPuasa && ` — Puasa: ${day.puasaSunnah[0].title}`,
                ]
                  .filter(Boolean)
                  .join("")
              }
            >
              {/* Vertical accent bar untuk puasa (di belakang holiday, di atas plain) */}
              {hasPuasa && !hasHoliday && puasaColor && (
                <div
                  className={cn(
                    "absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full",
                    puasaBarMap[puasaColor] || "bg-violet-500",
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Date numbers - stacked centered */}
              <span
                className={cn(
                  "font-bold leading-none tabular-nums",
                  "text-[15px] sm:text-lg",
                  day.isToday && "scale-110",
                )}
              >
                {day.gregorian.day}
              </span>
              <span
                className={cn(
                  "leading-none mt-1 tabular-nums",
                  "text-[10px] sm:text-[11px]",
                  "opacity-60",
                )}
              >
                {day.hijri.day}
              </span>

              {/* Marker row di bagian bawah cell — emoji holiday + puasa + count badge */}
              {(hasHoliday || hasPuasa) && (
                <div
                  className={cn(
                    "absolute bottom-1 left-0 right-0 flex items-center justify-center gap-0.5 px-1",
                    // Beri padding kiri extra kalau ada vertical bar (puasa only)
                    !hasHoliday && hasPuasa && "pl-2",
                  )}
                  aria-hidden="true"
                >
                  {hasHoliday && (
                    <span className="text-[11px] leading-none">
                      {day.holidays[0].emoji}
                    </span>
                  )}
                  {/* Puasa emoji: selalu tampil, baik bersama holiday maupun sendiri */}
                  {hasPuasa && (
                    <span
                      className={cn(
                        "leading-none",
                        "text-[10px]",
                        hasHoliday && "opacity-80",
                      )}
                    >
                      {day.puasaSunnah[0].emoji}
                    </span>
                  )}
                  {/* Count badge kalau ada lebih dari 1 marker */}
                  {day.puasaSunnah.length > 1 && (
                    <span className="text-[7px] font-bold opacity-60">
                      +{day.puasaSunnah.length - 1}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}