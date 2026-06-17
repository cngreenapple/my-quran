import { Play, Pause, X, Volume2, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/audio-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDuration } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSurahList } from "@/hooks/use-surah-list";

export function AudioPlayer() {
  const {
    currentSurah,
    currentSurahName,
    isPlaying,
    progress,
    duration,
    error,
    togglePlay,
    stop,
    seek,
  } = useAudio();
  const isMobile = useIsMobile();
  const { data: surahList } = useSurahList();

  if (!currentSurah) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const nextSurah = surahList?.find((s) => s.nomor === currentSurah + 1);
  const hasNext = !!nextSurah;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  const handleNext = () => {
    if (nextSurah) {
      stop();
      // Trigger play via event - simpler: use play directly
      const audio = document.querySelector("audio");
      if (audio) {
        audio.src = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${nextSurah.nomor}.mp3`;
        audio.play().catch(console.error);
      }
    }
  };

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 transition-transform duration-300 ease-out",
        currentSurah ? "translate-y-0" : "translate-y-full",
        isMobile ? "bottom-16 px-2 pb-2" : "bottom-3 px-4",
      )}
    >
      <div className={cn("mx-auto", isMobile ? "" : "max-w-3xl")}>
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/60 shadow-2xl shadow-black/10 p-3">
          {error ? (
            <div className="flex items-center gap-2 text-destructive text-sm py-1">
              <Volume2 className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-xs">{error}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={stop}
                className="h-7 px-2 text-xs"
              >
                Tutup
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Play/Pause */}
              <Button
                size="icon"
                onClick={togglePlay}
                className="rounded-full h-10 w-10 sm:h-11 sm:w-11 shrink-0 shadow-md shadow-primary/30 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </Button>

              {/* Info + Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {currentSurahName}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0 tabular-nums">
                    {formatDuration(progress)} / {formatDuration(duration)}
                  </span>
                </div>
                <div
                  className="relative h-1 bg-muted rounded-full cursor-pointer group/progress"
                  onClick={handleSeekClick}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"
                    style={{ left: `calc(${progressPercent}% - 6px)` }}
                  />
                </div>
              </div>

              {/* Next */}
              {hasNext && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="rounded-full h-9 w-9 shrink-0 hidden sm:flex"
                  aria-label="Surah berikutnya"
                  title={`Selanjutnya: ${nextSurah.namaLatin}`}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              )}

              {/* Stop */}
              <Button
                variant="ghost"
                size="icon"
                onClick={stop}
                className="rounded-full h-9 w-9 shrink-0"
                aria-label="Stop"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}