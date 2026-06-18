import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  title: string;
  subtitle?: string;
  subtitleClassName?: string;
  onPrev: () => void;
  onNext: () => void;
  showTodayButton?: boolean;
  onToday?: () => void;
  rightSlot?: React.ReactNode;
  leftSlot?: React.ReactNode;
}

export function CalendarHeader({
  title,
  subtitle,
  subtitleClassName,
  onPrev,
  onNext,
  showTodayButton = false,
  onToday,
  rightSlot,
  leftSlot,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      {leftSlot ?? (
        <button
          onClick={onPrev}
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      <div className="text-center flex-1 min-w-0">
        {subtitle && (
          <p className={cn("text-[10px] font-bold uppercase tracking-wider", subtitleClassName)}>
            {subtitle}
          </p>
        )}
        <p className="text-sm font-bold text-foreground truncate">{title}</p>
        {showTodayButton && onToday && (
          <button
            onClick={onToday}
            className="text-[10px] text-primary font-semibold hover:underline px-2 py-0.5 rounded-md hover:bg-muted"
          >
            Hari ini
          </button>
        )}
      </div>

      {rightSlot ?? (
        <button
          onClick={onNext}
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}