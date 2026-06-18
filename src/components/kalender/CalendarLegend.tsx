import { ISLAMIC_HOLIDAYS } from "@/data/islamic-holidays";
import { cn } from "@/lib/utils";
import { colorClasses } from "./constants";

export function CalendarLegend() {
  return (
    <div className="px-2">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
        Hari Besar:
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {ISLAMIC_HOLIDAYS.map((h) => {
          const c = colorClasses[h.color];
          return (
            <div key={h.id} className="flex items-center gap-1.5">
              <span className={cn("w-2.5 h-2.5 rounded shrink-0", c.dot)} />
              <span className="text-[10px] text-foreground/80 font-medium whitespace-nowrap">
                {h.emoji} {h.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}