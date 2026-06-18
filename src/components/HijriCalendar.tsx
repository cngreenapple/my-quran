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

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const WEEKDAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const HIJRI_MONTH_NAMES = ["Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadan", "Syawal", "Dzulqa'dah", "Dzulhijjah"];

export function HijriCalendar({ year, month, days, onPrev, onNext }: HijriCalendarProps) {
  const firstDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);
  const cells: (CalendarDay | null)[] = useMemo(
    () => [...Array(firstDayOfWeek).fill(null), ...days].concat(
      Array(Math.max(0, 42 - firstDayOfWeek - days.length)).fill(null)
    ),
    [firstDayOfWeek, days]
  );

  const hijriMonthInfo = useMemo(() => {
    if (days.length === 0) return { month: 1, year: 0 };
    const monthCounts: Record<number, number> = {};
    for (const d of days) {
      monthCounts[d.hijri.month] = (monthCounts[d.hijri.month] || 0) + 1;
    }
    let majorityMonth = days[0].hijri.month;
    let maxCount = 0;
    for (const [m, c] of Object.entries(monthCounts)) {
      if (c > maxCount) { maxCount = c; majorityMonth = Number(m); }
    }
    return { month: majorityMonth };
  }, [days]);

  return (
    <div>
      {/* Header navigasi bulan */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={onPrev} className="rounded-full h-9 w-9" aria-label="Bulan sebelumnya">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center px-2">
          <h2 className="text-base font-bold text-foreground">
            {MONTH_NAMES[month]} {year}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {HIJRI_MONTH_NAMES[hijriMonthInfo.month - 1]} Hijriah
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onNext} className="rounded-full h-9 w-9" aria-label="Bulan berikutnya">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Header nama hari */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_SHORT.map((wd) => (
          <div
            key={wd}
            className={cn(
              "text-center text-[10px] font-bold uppercase py-1",
              wd === "Jum" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="aspect-square" aria-hidden="true" />;
          }

          const containerClass = day.isToday
            ? "bg-emerald-600 text-white border-emerald-600"
            : day.isJumat
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-foreground border-emerald-200/50 dark:border-emerald-900/30"
              : "bg-card border-border/40 text-foreground hover:border-emerald-500/50";

          const tooltipParts = [
            `${day.gregorian.weekday}, ${day.gregorian.day} ${MONTH_NAMES[day.gregorian.month - 1]} ${day.gregorian.year}`,
            `${day.hijri.day} ${day.hijri.monthName} ${day.hijri.year} H`,
          ];
          if (day.holidays.length > 0) {
            tooltipParts.push("");
            tooltipParts.push("🎉 " + day.holidays.map(h => h.name).join(", "));
          }
          if (day.puasaSunnah.length > 0) {
            tooltipParts.push("");
            tooltipParts.push("🌙 " + day.puasaSunnah.map(p => p.title).join(", "));
          }

          return (
            <div
              key={day.gregorian.date.toISOString()}
              className={cn(
                "aspect-square rounded-lg border flex flex-col items-center justify-center",
                "cursor-pointer transition-all hover:scale-105",
                containerClass,
              )}
              title={tooltipParts.join("\n")}
              aria-label={tooltipParts.join(", ")}
            >
              {/* Tanggal Gregorian (besar) */}
              <span className="text-base font-bold tabular-nums leading-none">
                {day.gregorian.day}
              </span>
              {/* Tanggal Hijriah (kecil pudar) */}
              <span
                className={cn(
                  "text-[9px] font-semibold tabular-nums leading-none mt-0.5",
                  day.isToday ? "text-white/80" : "text-muted-foreground",
                )}
              >
                {day.hijri.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}