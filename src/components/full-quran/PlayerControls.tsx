import { Loader2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RepeatMode } from "@/hooks/use-audio-queue";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onTogglePlay: () => void;
  // Queue controls
  canGoPrev: boolean;
  onPrev: () => void;
  canGoNext: boolean;
  onNext: () => void;
  isShuffled: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
}

export function PlayerControls({
  isPlaying,
  isLoading,
  onTogglePlay,
  canGoPrev,
  onPrev,
  canGoNext,
  onNext,
  isShuffled,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
}: PlayerControlsProps) {
  const RepeatIcon = repeatMode === "single" ? Repeat1 : Repeat;

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={!canGoPrev}
        className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label="Surah sebelumnya dalam antrian"
      >
        <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleShuffle}
        className={cn(
          "rounded-full h-8 w-8",
          isShuffled
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-label={isShuffled ? "Matikan shuffle" : "Aktifkan shuffle"}
        aria-pressed={isShuffled}
      >
        <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onCycleRepeat}
        className={cn(
          "rounded-full h-8 w-8 relative",
          repeatMode !== "off"
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-label={`Mode repeat: ${repeatMode === "off" ? "mati" : repeatMode === "queue" ? "ulangi antrian" : "ulangi surah"}`}
      >
        <RepeatIcon className="w-3.5 h-3.5" aria-hidden="true" />
        {repeatMode === "single" && (
          <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold leading-none">1</span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePlay}
        className="rounded-full h-9 w-9 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-800"
        aria-label={isPlaying ? "Jeda" : "Putar"}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label="Surah berikutnya dalam antrian"
      >
        <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}