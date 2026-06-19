import { Flame, BookOpen, Star, TrendingUp } from "lucide-react";
import { useReadingStats } from "@/hooks/use-reading-stats";
import { cn } from "@/lib/utils";

export function StatsCard() {
  const { stats, getTodayCount } = useReadingStats();
  const todayCount = getTodayCount();

  const items = [
    { icon: Flame, label: "Streak", value: stats.streakDays, suffix: "h", accent: stats.streakDays > 0 },
    { icon: TrendingUp, label: "Hari ini", value: todayCount, suffix: "ayat" },
    { icon: BookOpen, label: "Surat", value: stats.surahsOpened.length, suffix: null },
    { icon: Star, label: "Total", value: stats.totalAyatRead, suffix: "ayat" },
  ];

  return (
    <div className="flex items-stretch gap-1 p-1.5 rounded-2xl border border-border/60 bg-card">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              "flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1.5 rounded-xl",
              item.accent ? "bg-orange-500/8" : "bg-muted/40",
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                item.accent ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" : "bg-primary/10 text-primary",
              )}
              aria-hidden="true"
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 flex flex-col">
              {/* Row angka + suffix — satu baris, no wrap */}
              <p className="text-sm font-bold tabular-nums leading-none truncate flex items-baseline gap-0.5">
                <span>{item.value}</span>
                {item.suffix && (
                  <span className="text-[9px] text-muted-foreground font-medium whitespace-nowrap shrink-0">
                    {item.suffix}
                  </span>
                )}
              </p>
              {/* Label — baris terpisah, truncate aman */}
              <p className="text-[9px] text-muted-foreground leading-none mt-1 uppercase tracking-wide font-semibold truncate">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}