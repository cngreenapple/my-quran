import { memo, useState, useRef, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TasbihDialProps {
  /** 0-100 percent */
  percent: number;
  /** Current count (e.g. 33 dari 33) */
  current: number;
  /** Target count */
  target: number;
  /** Color theme */
  color: "emerald" | "amber" | "sky" | "rose" | "violet";
  /** Tap handler — increment */
  onTap: () => void;
  /** Long-press handler — reset */
  onReset: () => void;
  /** True jika cycle sudah complete (visual cue) */
  isComplete: boolean;
}

const gradientMap: Record<TasbihDialProps["color"], { from: string; to: string; ring: string }> = {
  emerald: { from: "#10b981", to: "#047857", ring: "stroke-emerald-500" },
  amber: { from: "#f59e0b", to: "#b45309", ring: "stroke-amber-500" },
  sky: { from: "#0ea5e9", to: "#0369a1", ring: "stroke-sky-500" },
  rose: { from: "#f43f5e", to: "#9f1239", ring: "stroke-rose-500" },
  violet: { from: "#8b5cf6", to: "#5b21b6", ring: "stroke-violet-500" },
};

/**
 * Haptic patterns (only on REACH TARGET, not on regular tap):
 *
 * - TAP: no vibration (regular counter increment silent)
 * - COMPLETE (reach target): triple-ascending burst [100, 50, 150, 50, 200] = 550ms
 *   Pattern ascending: 100ms → 150ms → 200ms (escalating intensity).
 *   Plus secondary "echo" vibration 100ms kemudian untuk extra emphasis.
 *   Total perceived vibration: ~790ms — dramatic, jelas terasa.
 * - RESET: long single pulse [200] = 200ms — clear "reset" signal
 */
function hapticComplete() {
  if (!("vibrate" in navigator)) return;
  // Triple-ascending burst — escalate intensity
  navigator.vibrate([100, 50, 150, 50, 200]);
  // Secondary "echo" vibration 100ms later untuk extra emphasis
  setTimeout(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate([80, 40, 80]);
    }
  }, 650);
}

function hapticReset() {
  if ("vibrate" in navigator) navigator.vibrate([200]);
}

function TasbihDialComponent({
  percent,
  current,
  target,
  color,
  onTap,
  onReset,
  isComplete,
}: TasbihDialProps) {
  const [animating, setAnimating] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const tapTimeoutRef = useRef<number | null>(null);
  const celebrateTimeoutRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const lastHapticAtRef = useRef<number>(current);
  const grad = gradientMap[color];

  // SVG ring geometry
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  /**
   * Multi-milestone haptic trigger.
   *
   * Logic: setiap kali `current` sampai di kelipatan `target`, fire haptic.
   * - target=33: reach 33, 66, 99, 132, ... → haptic setiap kelipatan
   * - target=1000: reach 1000, 2000, 3000, ... → haptic setiap kelipatan
   *
   * Pakai ref `lastHapticAtRef` untuk track milestone terakhir yang sudah
   * di-trigger haptic. Saat `current` berubah:
   * - Hitung kelipatan tertinggi yang sudah passed: `Math.floor(current / target) * target`
   * - Kalau > lastHapticAt → berarti baru reach milestone baru → fire haptic
   *
   * Edge cases:
   * - Reset ke 0: `lastHapticAt` update ke 0, next reach target → haptic ✓
   * - Auto-reset harian (midnight): current 0, target 33, fresh day → haptic di 33 ✓
   * - Switch preset: target berubah → `lastHapticAt` reset ke 0 oleh dependency [target]
   * - Skip increment (current jumps dari 30 ke 35 somehow): tetap trigger karena
   *   cek `current` value, bukan increment-by-1
   */
  useEffect(() => {
    if (target <= 0) return;

    // Hitung milestone kelipatan target yang baru saja dicapai
    const newMilestone = Math.floor(current / target) * target;

    if (newMilestone > lastHapticAtRef.current && newMilestone > 0) {
      // Baru reach milestone baru!
      setCelebrating(true);
      hapticComplete();
      if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current);
      celebrateTimeoutRef.current = window.setTimeout(() => {
        setCelebrating(false);
      }, 800);
      lastHapticAtRef.current = newMilestone;
    } else if (current < lastHapticAtRef.current) {
      // Reset detected (current turun) — update ref supaya haptic fires di next milestone
      lastHapticAtRef.current = 0;
    }
  }, [current, target]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const handleTapStart = () => {
    // Long-press detection (700ms) untuk reset
    longPressTimerRef.current = window.setTimeout(() => {
      onReset();
      hapticReset();
    }, 700);
  };

  const handleTapEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    const nativeEvent = e.nativeEvent as MouseEvent;
    if (nativeEvent && "pointerType" in nativeEvent) {
      const pt = (nativeEvent as PointerEvent).pointerType;
      if (pt === "touch") return;
    }

    // Tap biasa: NO haptic (per request). Visual animation only.
    onTap();
    setAnimating(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = window.setTimeout(() => setAnimating(false), 180);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // Tap biasa: NO haptic. Reach target akan di-detect via useEffect [current].
    onTap();
    setAnimating(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = window.setTimeout(() => setAnimating(false), 180);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 select-none">
        {/* Outer pulse ring saat complete (subtle, ongoing) */}
        {isComplete && !celebrating && (
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping" aria-hidden="true" />
        )}

        {/* Celebration burst: extra rings + scale saat reach target */}
        {celebrating && (
          <>
            <div
              className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-2 rounded-full ring-4 ring-emerald-500/40 animate-pulse"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-4 rounded-full ring-2 ring-emerald-500/20 animate-pulse"
              style={{ animationDelay: "0.2s" }}
              aria-hidden="true"
            />
          </>
        )}

        {/* SVG progress ring */}
        <svg
          className={cn(
            "absolute inset-0 -rotate-90 transition-transform duration-300",
            celebrating && "scale-105",
          )}
          viewBox="0 0 240 240"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`tasbih-grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={grad.from} />
              <stop offset="100%" stopColor={grad.to} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/40"
          />
          {/* Progress */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={`url(#tasbih-grad-${color})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.3s ease-out",
              filter: celebrating ? "drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))" : undefined,
            }}
          />
        </svg>

        {/* Tap area */}
        <button
          type="button"
          onMouseDown={handleTapStart}
          onMouseUp={handleTapEnd}
          onMouseLeave={() => {
            if (longPressTimerRef.current) {
              clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = null;
            }
          }}
          onTouchStart={handleTapStart}
          onTouchEnd={handleTouchEnd}
          aria-label={`Tap untuk tambah counter. Saat ini ${current} dari ${target}. Tekan lama untuk reset.`}
          className={cn(
            "absolute inset-3 rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-[0.98] transition-transform shadow-xl",
            `bg-gradient-to-br ${isComplete ? "from-emerald-500 to-emerald-700" : "from-card to-card"}`,
            animating && "scale-[0.98]",
            celebrating && "scale-110 ring-4 ring-emerald-400/60",
          )}
          style={{
            transition: "transform 0.2s ease-out, box-shadow 0.3s ease-out",
          }}
        >
          {/* Counter angka besar */}
          <span
            className={cn(
              "text-6xl sm:text-7xl font-bold tabular-nums leading-none transition-transform",
              isComplete ? "text-white" : "text-foreground",
              celebrating && "scale-110",
            )}
          >
            {current}
          </span>

          {/* Target separator */}
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              isComplete ? "text-emerald-50/90" : "text-muted-foreground",
            )}
          >
            dari {target}
          </span>

          {/* Instruction hint */}
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider mt-1",
              isComplete ? "text-emerald-50/80" : "text-muted-foreground/70",
            )}
          >
            {celebrating
              ? "🎉 Alhamdulillah!"
              : isComplete
                ? "Tap untuk mulai lagi"
                : "Tap untuk hitung"}
          </span>
        </button>
      </div>

      {/* Reset button (kecil, di bawah dial) */}
      <button
        type="button"
        onClick={() => {
          onReset();
          hapticReset();
        }}
        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-full hover:bg-muted"
        aria-label="Reset counter"
      >
        <RotateCcw className="w-3 h-3" aria-hidden="true" />
        Reset counter
      </button>
      <p className="text-[9px] text-muted-foreground mt-1 italic">
        💡 Tekan lama tap area juga untuk reset
      </p>
    </div>
  );
}

export const TasbihDial = memo(TasbihDialComponent);