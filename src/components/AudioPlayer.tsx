import { Play, Pause, X, Volume2, SkipForward, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/audio-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDuration } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSurahList } from "@/hooks/use-surah-list";

export function AudioPlayer() {
  const { currentSurah, currentSurahName, isPlaying, progress, duration, error, isLoadingAudio, play, togglePlay, stop, seek } = useAudio();
  const isMobile = useIsMobile();
  const { data: surahList } = useSurahList();

  if (!currentSurah) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const nextSurah = surahList?.find((s) => s.nomor === currentSurah + 1);
  const hasNext = !!nextSurah && currentSurah < 114;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  const handleSeekKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); seek(Math.max(0, progress - 5)); }
    else if (e.key === "ArrowRight") { e.preventDefault(); seek(Math.min(duration, progress + 5)); }
  };

  const handleNext = () => { if (nextSurah) play(nextSurah.nomor, nextSurah.namaLatin); };

  return (
    <div className={cn("fixed left-0 right-0 z-50 transition-transform duration-300 ease-out pointer-events-auto", currentSurah ? "translate-y-0" : "translate-y-full pointer-events-none", isMobile ? "bottom-14 px-2 pb-2" : "bottom-3 px-4")}>
      <div className={cn("mx-auto", isMobile ? "" : "max-w-3xl")}>
        <div className="bg-card border border-border rounded-2xl shadow-xl p-2.5">
          {error ? (
            <div className="flex items-center gap-2 text-destructive text-xs py-1">
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">{error}</span>
              <Button size="sm" variant="ghost" onClick={stop} className="h-6 px-2 text-xs">Tutup</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="icon" onClick={togglePlay} disabled={isLoadingAudio} className="rounded-full h-9 w-9 shrink-0 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-70" aria-label={isPlaying ? "Pause" : "Play"}>
                {isLoadingAudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold truncate text-foreground flex items-center gap-1">
                    {isLoadingAudio && <Loader2 className="w-2.5 h-2.5 animate-spin text-muted-foreground" />}
                    {currentSurahName}
                  </p>
                  <span className="text-[9px] text-muted-foreground font-mono shrink-0 tabular-nums">{formatDuration(progress)} / {formatDuration(duration)}</span>
                </div>
                <div className="relative h-1 bg-muted rounded-full cursor-pointer group/progress" onClick={handleSeekClick} onKeyDown={handleSeekKey} role="slider" tabIndex={0} aria-label="Audio progress" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${formatDuration(progress)} dari ${formatDuration(duration)}`}>
                  <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-emerald-500 rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity" style={{ left: `calc(${progressPercent}% - 5px)` }} />
                </div>
              </div>
              {hasNext && (
                <Button variant="ghost" size="icon" onClick={handleNext} className="rounded-full h-8 w-8 shrink-0 hidden sm:flex" aria-label="Surah berikutnya" title={`Selanjutnya: ${nextSurah.namaLatin}`}>
                  <SkipForward className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={stop} className="rounded-full h-8 w-8 shrink-0" aria-label="Stop"><X className="w-3.5 h-3.5" /></Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}