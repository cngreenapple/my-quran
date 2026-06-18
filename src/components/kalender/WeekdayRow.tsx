import { INDONESIAN_WEEKDAYS_SHORT } from "@/lib/date";

interface WeekdayRowProps {
  className?: string;
}

export function WeekdayRow({ className }: WeekdayRowProps) {
  return (
    <div className={className ?? "grid grid-cols-7 gap-1 mb-1"} role="row">
      {INDONESIAN_WEEKDAYS_SHORT.map((d) => (
        <div
          key={d}
          className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1"
        >
          {d}
        </div>
      ))}
    </div>
  );
}