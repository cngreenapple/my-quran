import { useState, useEffect, useRef } from "react";

interface UsePullToRefreshOptions {
  /** Refresh handler. Promise akan di-await, lalu snap-back animasi selesai. */
  onRefresh: () => Promise<unknown> | void;
  /** Jarak pull minimum (px) untuk trigger refresh. Default 80. */
  threshold?: number;
  /** Jarak pull maksimum (px) dengan resistance. Default 140. */
  maxPull?: number;
  /** Resistance factor (0-1). Pull akan di-scale dengan factor ini. Default 0.5. */
  resistance?: number;
  /** Disable handler (untuk conditional rendering atau temporary disable). Default true. */
  enabled?: boolean;
}

interface UsePullToRefreshReturn {
  /** Current pull distance (0 sampai maxPull). */
  pullDistance: number;
  /** True saat refresh sedang berjalan. */
  isRefreshing: boolean;
  /** Progress 0-1 (pullDistance / threshold, capped at 1). */
  pullProgress: number;
  /** True saat pull sudah reach threshold. */
  isReady: boolean;
}

/**
 * Custom hook untuk pull-to-refresh gesture.
 *
 * Cara kerja:
 * 1. Pasang touch listeners di window (passive: false untuk preventDefault iOS native)
 * 2. Track touchstart saat user di top-of-page (window.scrollY <= 5) DAN input tidak focused
 * 3. Hitung pull distance di touchmove, apply resistance (delta * 0.5), cap di maxPull
 * 4. Saat touchend, kalau pullDistance >= threshold → trigger onRefresh
 * 5. Set isRefreshing true selama refresh, snap-back animation saat selesai
 *
 * State management:
 * - pullDistance, isRefreshing: React state (trigger re-render untuk indicator)
 * - pullDistanceRef, isRefreshingRef: mirror di ref supaya listener handler
 *   selalu baca nilai terbaru tanpa re-attach listener tiap touchmove
 * - hasHapticFiredRef: prevent multiple haptic fires dalam satu pull gesture
 * - isPullingRef: gate antara "idle" dan "actively pulling" state
 *
 * Edge cases:
 * - User scroll up saat pulling → cancel pull (isPullingRef = false)
 * - Window scroll > 5 saat touchmove → cancel pull (user mulai scroll ke bawah)
 * - Input/textarea focused → ignore (jangan trigger pull saat ngetik)
 * - Component unmount saat refresh → cleanup di useEffect return, isRefreshing
 *   cleanup tidak perlu di-mirror (React 18+ aman setState on unmounted)
 * - iOS Safari native pull-to-refresh: di-suppress dengan preventDefault
 *
 * Performance:
 * - Listeners attach sekali di useEffect dengan [enabled] dependency
 * - Values passed ke handler via ref, bukan closure → no stale closure
 * - setState setiap touchmove = re-render 60fps, tapi React batch update
 *   dengan rAF jadi smooth. Indicator JSX ringan (1 div + 1 icon).
 */
function isInputFocused(): boolean {
  if (typeof document === "undefined") return false;
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName.toLowerCase();
  return tag === "input" || tag === "textarea";
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 140,
  resistance = 0.5,
  enabled = true,
}: UsePullToRefreshOptions = {}): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs untuk listener handler (avoid stale closure tanpa re-attach listener)
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const hasHapticFiredRef = useRef(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const thresholdRef = useRef(threshold);
  const maxPullRef = useRef(maxPull);
  const resistanceRef = useRef(resistance);

  // Sync refs dengan props/state
  useEffect(() => {
    pullDistanceRef.current = pullDistance;
  }, [pullDistance]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  useEffect(() => {
    maxPullRef.current = maxPull;
  }, [maxPull]);

  useEffect(() => {
    resistanceRef.current = resistance;
  }, [resistance]);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      if (typeof window !== "undefined" && window.scrollY > 5) return;
      if (isInputFocused()) return;

      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
      hasHapticFiredRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current) return;
      if (isRefreshingRef.current) return;

      // Re-check scroll position (user mungkin mulai scroll)
      if (typeof window !== "undefined" && window.scrollY > 5) {
        isPullingRef.current = false;
        setPullDistance(0);
        return;
      }

      const delta = e.touches[0].clientY - startYRef.current;

      if (delta > 0) {
        // User menarik ke bawah → preventDefault untuk suppress
        // iOS Safari native pull-to-refresh
        if (e.cancelable) e.preventDefault();

        const pull = Math.min(delta * resistanceRef.current, maxPullRef.current);
        setPullDistance(pull);
        pullDistanceRef.current = pull;

        // Haptic feedback saat cross threshold (sekali per pull)
        if (pull >= thresholdRef.current && !hasHapticFiredRef.current) {
          hasHapticFiredRef.current = true;
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(10);
          }
        }
      } else {
        // User menarik ke atas → cancel pull
        isPullingRef.current = false;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      const currentPull = pullDistanceRef.current;
      const currentThreshold = thresholdRef.current;

      if (currentPull >= currentThreshold && !isRefreshingRef.current) {
        setIsRefreshing(true);
        setPullDistance(currentThreshold); // Hold di threshold selama refresh
        pullDistanceRef.current = currentThreshold;

        try {
          await Promise.resolve(onRefreshRef.current());
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          pullDistanceRef.current = 0;
        }
      } else {
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    };

    // passive: false untuk touchmove supaya bisa preventDefault iOS
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [enabled]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const isReady = pullDistance >= threshold;

  return {
    pullDistance,
    isRefreshing,
    pullProgress,
    isReady,
  };
}