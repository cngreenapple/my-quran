import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarDay } from "@/types/hijri-calendar";

interface HijriCalendarProps {
  year: number;
  month: number;
  days: CalendarDay[];
  onPrev: () => void;
  onNext: () => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const WEEKDAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const HIJRI_MONTH_NAMES = [
  "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
];

const HIJRI_MONTH_SHORT = [
  "Muh", "Saf", "Rab1", "Rab2", "Jum1", "Jum2",
  "Raj", "Sya", "Ram", "Syw", "Dhuq", "Dhuh",
];

const holidayStyleMap: Record<string, { bg: string; text: string; ring: string }> = {
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
  const firstDayOfWeek = useMemo(() => {
    if (days.length === 0) return 0;
    return new Date(year, month, 1).getDay();
  }, [year, month, days.length]);

  const cells: (CalendarDay | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...days,
  ];
  while (cells.length < 42) cells.push(null);

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

  const currentHijriMonthName = HIJRI_MONTH_NAMES[hijriMonthInfo.month - 1] || "";
  const currentHijriMonthShort = HIJRI_MONTH_SHORT[hijriMonthInfo.month - 1] || "";

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
              wd === "Jum" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
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
                className="min-h-[78px] sm:min-h-[92px]"
                aria-hidden="true"
              />
            );
          }

          const hasHoliday = day.holidays.length > 0;
          const hasPuasa = day.puasaSunnah.length > 0;
          const holidayColor = hasHoliday ? day.holidays[0].color : null;
          const puasaColor = hasPuasa ? day.puasaSunnah[0].color : null;
          const primaryHoliday = hasHoliday ? day.holidays[0] : null;
          const primaryPuasa = hasPuasa ? day.puasaSunnah[0] : null;

          // Background — priority: today > holiday > jumat > weekend > default
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
            containerClass = cn("bg-emerald-50/70 dark:bg-emerald-950/25", "text-foreground");
          } else if (day.isWeekend) {
            containerClass = cn("bg-muted/40 text-muted-foreground");
          } else {
            containerClass = cn("bg-card border border-border/40 text-foreground");
          }

          // Short holiday label (maks 2 kata)
          const holidayShort = primaryHoliday
            ? primaryHoliday.name
                .replace(/Hari Raya /, "HR ")
                .replace(/Tahun Baru /, "TB ")
                .replace(/Maulid Nabi Muhammad ﷺ/, "Maulid Nabi")
                .replace(/Isra' & Mi'raj/, "Isra Mi'raj")
                .replace(/Nuzulul Qur'an/, "Nuzul Quran")
                .replace(/Malam Lailatul Qadar/, "Lailatul Qadar")
                .replace(/Hari Arafah/, "Arafah")
            : "";

          // Short puasa label
          const puasaShort = primaryPuasa
            ? (primaryPuasa.note === "Puasa Senin" ? "Senin"
              : primaryPuasa.note === "Puasa Kamis" ? "Kamis"
              : primaryPuasa.title === "Puasa Ayyamul Bidh" ? "Ayyamul Bidh"
              : primaryPuasa.title === "Puasa Senin & Kamis" ? ""
              : primaryPuasa.title === "Puasa Arafah" ? "Arafah"
              : primaryPuasa.title === "Puasa Asyura" ? "Asyura"
              : primaryPuasa.title === "Puasa Tasu'a" ? "Tasu'a"
              : primaryPuasa.title === "Puasa 9 Hari Pertama Dzulhijjah" ? "Awal Dzulhijjah"
              : primaryPuasa.title === "Puasa 6 Hari di Bulan Syawal" ? "Syawal"
              : primaryPuasa.title.length > 14 ? primaryPuasa.title.slice(0, 12) + "…" : primaryPuasa.title)
            : "";

          // Tooltip lengkap untuk desktop hover
          const tooltipLines = [
            `${day.gregorian.weekday}, ${day.gregorian.day} ${MONTH_NAMES[day.gregorian.month - 1]} ${day.gregorian.year}`,
            `${day.hijri.day} ${day.hijri.monthName} ${day.hijri.year} H`,
          ];
          if (hasHoliday) {
            tooltipLines.push("");
            tooltipLines.push(`🎉 ${primaryHoliday!.name}`);
            if (primaryHoliday!.greeting) tooltipLines.push(`   ${primaryHoliday!.greeting}`);
          }
          if (hasPuasa) {
            tooltipLines.push("");
            tooltipLines.push(`${primaryPuasa!.emoji} ${primaryPuasa!.title}`);
            if (primaryPuasa!.note) tooltipLines.push(`   ${primaryPuasa!.note}`);
            if (day.puasaSunnah.length > 1) {
              tooltipLines.push(`   +${day.puasaSunnah.length - 1} puasa lainnya`);
            }
          }
          const tooltip = tooltipLines.join("\n");

          const ariaLabel = [
            `${day.gregorian.weekday}, ${day.gregorian.day} ${MONTH_NAMES[day.gregorian.month - 1]} ${day.gregorian.year}`,
            `${day.hijri.day} ${HIJRI_MONTH_NAMES[day.hijri.month - 1]} ${day.hijri.year} Hijriah`,
            hasHoliday ? `— ${primaryHoliday!.name}` : "",
            hasPuasa ? `— Puasa: ${primaryPuasa!.title}` : "",
            day.isJumat ? "(Jumat)" : "",
            day.isToday ? "(hari ini)" : "",
          ].filter(Boolean).join(" ");

          return (
            <div
              key={day.gregorian.date.toISOString()}
              className={cn(
                "relative min-h-[78px] sm:min-h-[92px] rounded-xl",
                "flex flex-col items-stretch justify-start",
                "cursor-pointer transition-all duration-150",
                "hover:scale-[1.04] hover:shadow-md active:scale-[0.97]",
                "overflow-hidden",
                containerClass,
              )}
              title={tooltip || undefined}
              aria-label={ariaLabel}
            >
              {/* Vertical accent bar untukpuasa (di belakang holiday, di atas plain) */}
              {hasPuasa && !hasHoliday && puasaColor && (
                <div
                  className={cn(
                    "absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full z-0",
                    puasaBarMap[puasaColor] || "bg-violet-500",
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Baris atas: nama hari pendek + marker emoji (jika ada) */}
              <div className="flex items-center justify-between px-1.5 pt-1 relative z-10">
                <span
                  className={cn(
                    "text-[8px] sm:text-[9px] font-bold uppercase tracking-wider",
                    day.isJumat ? "text-emerald-600 dark:text-emerald-400" : "opacity-60",
                    day.isToday && "text-primary-foreground opacity-100",
                  )}
                >
                  {day.gregorian.weekday.slice(0, 3)}
                </span>
                {hasHoliday && (
                  <span className="text-[10px] leading-none" aria-hidden="true">
                    {primaryHoliday!.emoji}
                  </span>
                )}
              </div>

              {/* Baris tengah: tanggal Gregorian (besar) + tanggal Hijri (kecil) */}
              <div className="flex-1 flex flex-col items-center justify-center px-1 relative z-10">
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
                    "leading-none mt-0.5 tabular-nums",
                    "text-[9px] sm:text-[10px]",
                    "opacity-60",
                  )}
                >
                  {day.hijri.day}
                </span>
              </div>

              {/* Baris bawah: label holiday / puasa */}
              {(holidayShort || puasaShort || hasPuasa) && (
                <div
                  className={cn(
                    "px-1 pb-1 pt-0.5 relative z-10",
                    "text-[8px] sm:text-[9px] font-semibold leading-tight text-center",
                    "line-clamp-2 min-h-[14px] sm:min-h-[16px]",
                    day.isToday ? "text-primary-foreground/90" : "opacity-80",
                    !hasHoliday && hasPuasa && "pl-2",
                  )}
                  aria-hidden="true"
                >
                  {holidayShort && (
                    <div className="truncate">{holidayShort}</div>
                  )}
                  {!holidayShort && puasaShort && (
                    <div className="truncate">{puasaShort}</div>
                  )}
                  {day.puasaSunnah.length > 1 && (
                    <div className="text-[7px] opacity-60 mt-0.5">
                      +{day.puasaSunnah.length - 1} puasa
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Caption bulan Hijriah ringkas untuk konteks di bawah grid */}
      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        Bulan Hijriah: <span className="font-semibold">{currentHijriMonthShort} {hijriMonthInfo.year} H</span>
        {" • "}
        Hari besar: <span className="font-semibold">
          {days.some(d => d.holidays.length > 0) ? days.filter(d => d.holidays.length > 0).length : 0}
        </span>
        {" • "}
        Puasa sunnah: <span className="font-semibold">{days.reduce((s, d) => s + d.puasaSunnah.length, 0)}</span> kesempatan
      </p>
    </div>
  );
}