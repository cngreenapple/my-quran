import { cn } from "@/lib/utils";
import type { IslamicHoliday } from "@/data/islamic-holidays";
import { colorClasses } from "./constants";

interface DayCellProps {
  day: number;
  isToday: boolean;
  holiday?: IslamicHoliday;
  /** Label calendar system for screen reader: "Hijriah" or "Masehi" */
  calendarSystem?: "hijriah" | "masehi";
  /** Context untuk aria-label, misal "Muharram 1447 H" */
  context?: string;
}

export function DayCell({
  day,
  isToday,
  holiday,
  calendarSystem,
  context,
}: DayCellProps) {
  const c = holiday ? colorClasses[holiday.color] : null;

  return (
    <div
      className={cn(
        "relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all",
        isToday
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
          : c
            ? `${c.text} ${c.emojiBg} ring-1 ${c.ring}`
            : "text-foreground hover:bg-muted",
      )}
      role="gridcell"
      aria-label={
        holiday
          ? `${day}${context ? " " + context : ""}${calendarSystem ? " " + calendarSystem : ""} - ${holiday.name}`
          : `${day}${context ? " " + context : ""}`
      }
      title={holiday?.name}
    >
      <span
        className={cn(
          "tabular-nums leading-none",
          isToday ? "text-sm font-bold" : "text-xs",
        )}
      >
        {day}
      </span>
      {holiday && (
        <span className="text-[8px] leading-none mt-0.5" aria-hidden="true">
          {holiday.emoji}
        </span>
      )}
    </div>
  );
}

/**
 * Empty cell placeholder untuk alignment grid
 * (padding hari di awal bulan sebelum tanggal 1)
 */
export function EmptyDayCell() {
  return <div aria-hidden="true" />;
}