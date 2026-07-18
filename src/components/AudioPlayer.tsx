import { memo } from "react";
import { Play, Pause, X, Volume2, SkipForward, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/audio-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDuration } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSurahList } from "@/hooks/use-surah-list";

/**
 * AudioPlayer — global persistent player, di-mount di AppShell (App.tsx).
 *
 * FIX glitch layar (regression dari versi sebelumnya):
 *
 * 1. Single instance: AudioPlayer TIDAK di-mount per-page lagi.
 *    Sebelumnya tiap page mount `<AudioPlayer />` sendiri, sehingga
 *    setiap navigasi → unmount old + mount new → flash visual 1 frame
 *    yang terlihat sebagai glitch.
 *
 * 2. `data-state` attribute untuk animasi: sebelumnya pakai toggle
 *    className boolean (`translate-y-0` vs `translate-y-full`) yang
 *    bisa race-condition dengan transition. Pakai data-state="open"|"closed"
 *    lebih deterministic.
 *
 * 3. `will-change-transform` di container: hint browser untuk
 *    promote element ke compositor layer, GPU-accelerated.
 *
 * 4. Z-index `z-40`: di bawah PWAStatusBar (`z-[1100]`) dan Header
 *    (`z-[1000]`) supaya tidak pernah overlap dengan notifikasi
 *    offline / install banner.
 */
export const AudioPlayer = memo(function AudioPlayer() {
  const { currentSurah } = useAudio();
  if (!currentSurah) return null;
  return <AudioPlayerContent />;
});

const AudioPlayerContent = memo(function AudioPlayerContent() {
  const {
    currentSurah,
    currentSurahName,
    isPlaying,
    isLoadingAudio,
    play,
    togglePlay,
    stop,
  } = useAudio();
  const isMobile = useIsMobile();
  const { data: surahList } = useSurahList();

  const nextSurah = currentSurah ? surahList?.find((s) => s.nomor === currentSurah + 1) : undefined;
  const hasNext = !!nextSurah && (currentSurah ?? 0) < 114;

  const handleNext = () => {
    if (nextSurah) play(nextSurah.nomor, nextSurah.namaLatin);
  };

  return (
    <div
      data-state="open"
      className={cn(
        "fixed left-0 right-0 z-40 pointer-events-auto",
        "transition-transform duration-300 ease-out will-change-transform",
        "data-[state=open]:translate-y-0",
        "data-[state=closed]:translate-y-full data-[state=closed]:pointer-events-none",
        isMobile ? "bottom-14 px-2 pb-2" : "bottom-3 px-4",
      )}
    >
      <ProgressSection
        isPlaying={isPlaying}
        isLoadingAudio={isLoadingAudio}
        togglePlay={togglePlay}
        currentSurahName={currentSurahName}
        hasNext={hasNext}
        onNext={handleNext}
        onStop={stop}
        nextSurahName={nextSurah?.namaLatin}
      />
    </div>
  );
});

// ============================================================================
// Sub-komponen: ProgressSection (isolated — hanya re-render saat progress berubah)
// ============================================================================

interface ProgressSectionProps {
  isPlaying: boolean;
  isLoadingAudio: boolean;
  togglePlay: () => void;
  currentSurahName: string;
  hasNext: boolean;
  onNext: () => void;
  onStop: () => void;
  nextSurahName?: string;
}

const ProgressSection = memo(function ProgressSection({
  isPlaying,
  isLoadingAudio,
  togglePlay,
  currentSurahName,
  hasNext,
  onNext,
  onStop,
  nextSurahName,
}: ProgressSectionProps) {
  // Pakai useAudio lokal untuk progress/duration — hanya komponen ini yang re-render
  // saat progress tick, bukan parent shell.
  const { progress, duration, error, seek } = useAudio();
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Pre-compute formatDuration sekali saja
  const durationStr = formatDuration(duration);
  const progressStr = formatDuration(progress);

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    seek(percent * duration);
  };

  const handleSeekKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      seek(Math.max(0, progress - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      seek(progress + 5);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-2.5">
          <div className="flex items-center gap-2 text-destructive text-xs py-1">
            <Volume2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="ghost" onClick={onStop} className="h-6 px-2 text-xs">
              Tutup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-2.5">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            onClick={togglePlay}
            disabled={isLoadingAudio}
            className="rounded-full h-9 w-9 shrink-0 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-semibold truncate text-foreground flex items-center gap-1">
                {isLoadingAudio && (
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-muted-foreground" aria-hidden="true" />
                )}
                {currentSurahName}
              </p>
              <span className="text-[9px] text-muted-foreground font-mono shrink-0 tabular-nums">
                {progressStr} / {durationStr}
              </span>
            </div>
            <div
              className="relative h-1 bg-muted rounded-full cursor-pointer group/progress will-change-[background-position]"
              onClick={handleSeekClick}
              onKeyDown={handleSeekKey}
              role="slider"
              tabIndex={0}
              aria-label="Audio progress"
              aria-valuenow={Math.round(progressPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${progressStr} dari ${durationStr}`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-[width] duration-100 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-emerald-500 rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 5px)` }}
              />
            </div>
          </div>

          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="rounded-full h-8 w-8 shrink-0 hidden sm:flex"
              aria-label="Surah berikutnya"
              title={`Selanjutnya: ${nextSurahName}`}
            >
              <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            className="rounded-full h-8 w-8 shrink-0"
            aria-label="Stop"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
});