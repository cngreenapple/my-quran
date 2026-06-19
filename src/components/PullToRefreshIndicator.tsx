import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  /** Current pull distance (0 sampai maxPull). */
  pullDistance: number;
  /** True saat refresh sedang berjalan (icon spin). */
  isRefreshing: boolean;
  /** Threshold yang dipakai hook (default 80). */
  threshold?: number;
  /** Max pull yang dipakai hook (default 140). */
  maxPull?: number;
}

/**
 * Visual indicator untuk pull-to-refresh gesture.
 *
 * Position: fixed top-13 (52px) — tepat di bawah Header (h-13 = 52px).
 * Z-index: 60 — di atas konten biasa (z-default), di bawah Header (z-[1000]).
 *
 * Animation states:
 * - Idle: hidden (return null saat pullDistance < 5 && !isRefreshing)
 * - Pulling: translate down sesuai pull, rotate 0-360°, scale 0.5-1
 * - Ready: border + icon color → primary (threshold reached)
 * - Refreshing: icon spin animates infinitely
 *
 * Element hierarchy (transforms tidak conflict):
 * - Outer <div>: translateY (vertical movement) + opacity
 * - Inner <div>: rotate + scale (visual feedback untuk pull direction)
 * - <RefreshCw>: spin animation saat refresh
 *
 * Performance:
 * - Render minimal (1 outer div, 1 inner div, 1 icon)
 * - Inline styles untuk transform → GPU-accelerated, no re-paint
 * - Hidden via early return saat idle, no DOM overhead
 */
export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 80,
  maxPull = 140,
}: PullToRefreshIndicatorProps) {
  const pullProgress = Math.min(pullDistance / threshold, 1);
  const isReady = pullDistance >= threshold;

  // Hide saat idle (no pull, no refresh) supaya gak ada DOM overhead
  if (pullDistance < 5 && !isRefreshing) return null;

  // Cap translateY supaya indicator gak nyasar ke luar viewport
  const translateY = Math.min(pullDistance, maxPull);

  return (
    <div
      className="fixed left-0 right-0 z-[60] flex items-center justify-center pointer-events-none"
      style={{
        top: 52, // right below Header (h-13 = 52px)
        transform: `translateY(${translateY}px)`,
        opacity: Math.min(pullProgress * 2, 1),
      }}
      aria-hidden="true"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full bg-card border-2 flex items-center justify-center shadow-lg transition-colors duration-200",
          isReady || isRefreshing
            ? "border-primary text-primary"
            : "border-border text-muted-foreground",
        )}
        style={{
          // Cap rotation at 360° (= visually 0°)
          transform: `rotate(${pullProgress * 360}deg) scale(${0.5 + pullProgress * 0.5})`,
        }}
      >
        <RefreshCw
          className={cn(
            "w-4 h-4 transition-transform",
            isRefreshing && "animate-spin",
          )}
        />
      </div>
    </div>
  );
}