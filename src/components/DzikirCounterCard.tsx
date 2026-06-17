import { memo, useState, useRef } from "react";
import { RotateCcw, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DzikirItem } from "@/types/dzikir";
import { useDzikirCounter } from "@/hooks/use-dzikir-counter";

interface DzikirCounterCardProps {
  categoryId: string;
  item: DzikirItem;
  color: "emerald" | "amber" | "sky" | "rose" | "violet";
}

const colorClasses: Record<DzikirCounterCardProps["color"], {
  bg: string;
  bgHover: string;
  text: string;
  border: string;
  ring: string;
  gradient: string;
  progress: string;
}> = {
  emerald: {
    bg: "bg-emerald-500/10",
    bgHover: "active:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    ring: "ring-emerald-500/40",
    gradient: "from-emerald-500 to-emerald-700",
    progress: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    bgHover: "active:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    ring: "ring-amber-500/40",
    gradient: "from-amber-500 to-amber-700",
    progress: "bg-amber-500",
  },
  sky: {
    bg: "bg-sky-500/10",
    bgHover: "active:bg-sky-500/15",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/30",
    ring: "ring-sky-500/40",
    gradient: "from-sky-500 to-sky-700",
    progress: "bg-sky-500",
  },
  rose: {
    bg: "bg-rose-500/10",
    bgHover: "active:bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
    ring: "ring-rose-500/40",
    gradient: "from-rose-500 to-rose-700",
    progress: "bg-rose-500",
  },
  violet: {
    bg: "bg-violet-500/10",
    bgHover: "active:bg-violet-500/15",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/30",
    ring: "ring-violet-500/40",
    gradient: "from-violet-500 to-violet-700",
    progress: "bg-violet-500",
  },
};

function DzikirCounterCardComponent({
  categoryId,
  item,
  color,
}: DzikirCounterCardProps) {
  const { getCounter, increment, reset } = useDzikirCounter();
  const counter = getCounter(categoryId, item.id, item.count);
  const [animating, setAnimating] = useState(false);
  const tapTimeoutRef = useRef<number | null>(null);

  const colors = colorClasses[color];
  const progress = (counter.current / item.count) * 100;
  const isComplete = counter.completed;
  const remaining = Math.max(0, item.count - counter.current);

  const handleTap = () => {
    if (isComplete) return;

    // Haptic feedback (if available)
    if ("vibrate" in navigator) {
      navigator.vibrate(15);
    }

    increment(categoryId, item.id, item.count);
    setAnimating(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = window.setTimeout(() => setAnimating(false), 200);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    reset(categoryId, item.id, item.count);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card overflow-hidden transition-all",
        isComplete ? colors.border : "border-border/60",
      )}
    >
      {/* Header with counter */}
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between cursor-pointer select-none",
          isComplete ? colors.bg : "",
          !isComplete && colors.bgHover,
        )}
        onClick={handleTap}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleTap();
          }
        }}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform",
              isComplete
                ? `bg-gradient-to-br ${colors.gradient} text-white`
                : `${colors.bg} ${colors.text}`,
              animating && "scale-110",
            )}
          >
            {isComplete ? (
              <Check className="w-4 h-4" />
            ) : (
              <span>{counter.current}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-semibold",
                isComplete ? colors.text : "text-foreground",
              )}
            >
              {isComplete ? "Selesai ✓" : `Sisa ${remaining}x`}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Target: {item.count}x
            </p>
          </div>
        </div>
        {!isComplete && counter.current > 0 && (
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0 ml-2"
            aria-label="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted/50">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            colors.progress,
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Arabic */}
        <p
          className="font-arabic text-right text-xl sm:text-2xl leading-[2.2] text-foreground"
          dir="rtl"
          lang="ar"
        >
          {item.arabic}
        </p>

        {/* Latin */}
        <p className={cn("text-sm italic leading-relaxed", colors.text)}>
          {item.latin}
        </p>

        {/* Translation */}
        <p className="text-sm text-foreground/80 leading-relaxed">
          {item.translation}
        </p>

        {/* Fawaid (benefits) */}
        {item.fawaid && (
          <div className="rounded-xl p-3 bg-muted/30 border-l-2 border-current opacity-80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Keutamaan
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed italic">
              {item.fawaid}
            </p>
          </div>
        )}

        {/* Source */}
        {item.source && (
          <p className="text-[10px] text-muted-foreground font-medium">
            — {item.source}
          </p>
        )}
      </div>

      {/* Big Tap Area (Mobile-friendly) */}
      {!isComplete && (
        <button
          onClick={handleTap}
          className={cn(
            "w-full py-3.5 text-sm font-bold uppercase tracking-wider transition-all",
            `bg-gradient-to-r ${colors.gradient} text-white`,
            "active:scale-[0.99] active:opacity-90",
          )}
        >
          Tap untuk Dzikir ({counter.current}/{item.count})
        </button>
      )}
    </div>
  );
}

export const DzikirCounterCard = memo(DzikirCounterCardComponent);