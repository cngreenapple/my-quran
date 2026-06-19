import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ListMusic,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAudio } from "@/contexts/audio-context";
import { useSurahList } from "@/hooks/use-surah-list";
import { useAudioQueue } from "@/hooks/use-audio-queue";
import { cn } from "@/lib/utils";

interface FullQuranPlayerProps {
  className?: string;
}

export function FullQuranPlayer({ className }: FullQuranPlayerProps) {
  const audio = useAudio();
  const { data: surahList } = useSurahList();

  const queue = useAudioQueue({
    surahList,
    onPlaySurah: audio.play,
    onStop: audio.stop,
  });

  /**
   * Subscribe ke event "surah ended" supaya queue bisa auto-play next.
   * Delegasi ke queue.onSurahEnded (return boolean → diteruskan ke audio context).
   */
  useEffect(() => {
    const unsubscribe = audio.onSurahEnded((surahNumber) => {
      // Delegate ke queue.onSurahEnded (sudah return boolean).
      // `false` → caller (audio context) pakai default auto-next.
      // `true` → caller suppress default (queue sudah handle).
      return queue.onSurahEnded(surahNumber);
    });
    return unsubscribe;
  }, [audio, queue]);

  const [expanded, setExpanded] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [fromNomor, setFromNomor] = useState(1);
  const [toNomor, setToNomor] = useState(30);

  const currentSurahInfo = useMemo(() => {
    if (queue.currentSurah === null || !surahList) return null;
    return surahList.find((s) => s.nomor === queue.currentSurah) ?? null;
  }, [queue.currentSurah, surahList]);

  const handlePlayFull = useCallback(() => {
    queue.playAll();
    setShowRangePicker(false);
  }, [queue]);

  const handlePlayRange = useCallback(() => {
    queue.playRange(fromNomor, toNomor);
    setShowRangePicker(false);
  }, [queue, fromNomor, toNomor]);

  const handleStop = useCallback(() => {
    queue.stop();
  }, [queue]);

  const RepeatIcon = queue.repeatMode === "single" ? Repeat1 : Repeat;

  if (!queue.isActive && !expanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(true)}
        className={cn(
          "rounded-full gap-1.5 h-8 text-xs font-semibold",
          "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10",
          className,
        )}
        aria-label="Buka mode baca Al-Qur'an full"
      >
        <ListMusic className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Baca Full</span>
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/8 via-emerald-500/3 to-transparent shadow-sm",
        className,
      )}
    >
      <CardContent className="p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
              <BookOpen className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider leading-none">
                Mode Baca Full
              </p>
              <p className="text-[11px] text-foreground/80 font-medium truncate leading-tight mt-0.5">
                {queue.isActive && currentSurahInfo
                  ? `${currentSurahInfo.namaLatin} (${queue.currentIndex + 1}/${queue.totalInQueue})`
                  : "Pilih surah untuk mulai"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {queue.isActive && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStop}
                className="rounded-full h-7 w-7 text-muted-foreground hover:text-destructive"
                aria-label="Hentikan mode baca full"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-full h-7 w-7"
              aria-label={expanded ? "Ciutkan panel" : "Buka panel"}
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {queue.isActive && (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-[10px]">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {queue.progressPercent}%
              </span>
              <span className="text-muted-foreground tabular-nums">
                {queue.remaining} surah tersisa
              </span>
            </div>
            <div
              className="h-1 bg-emerald-500/20 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={queue.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress baca full: ${queue.progressPercent} persen`}
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                style={{ width: `${queue.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {queue.isActive && (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={queue.prev}
              disabled={queue.currentIndex === 0}
              className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Surah sebelumnya dalam antrian"
            >
              <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={queue.toggleShuffle}
              className={cn(
                "rounded-full h-8 w-8",
                queue.isShuffled
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={queue.isShuffled ? "Matikan shuffle" : "Aktifkan shuffle"}
              aria-pressed={queue.isShuffled}
            >
              <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={queue.cycleRepeat}
              className={cn(
                "rounded-full h-8 w-8 relative",
                queue.repeatMode !== "off"
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`Mode repeat: ${queue.repeatMode === "off" ? "mati" : queue.repeatMode === "queue" ? "ulangi antrian" : "ulangi surah"}`}
            >
              <RepeatIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {queue.repeatMode === "single" && (
                <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold leading-none">1</span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={audio.togglePlay}
              className="rounded-full h-9 w-9 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-800"
              aria-label={audio.isPlaying ? "Jeda" : "Putar"}
            >
              {audio.isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : audio.isPlaying ? (
                <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={queue.next}
              disabled={queue.currentIndex >= queue.queue.length - 1 && queue.repeatMode !== "queue"}
              className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Surah berikutnya dalam antrian"
            >
              <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}

        {expanded && (
          <div className="pt-2 border-t border-emerald-500/20 space-y-2 animate-fade-in">
            {!showRangePicker ? (
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePlayFull}
                  className="rounded-full h-8 text-xs gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800"
                  disabled={!surahList}
                >
                  <ListMusic className="w-3.5 h-3.5" aria-hidden="true" />
                  Full 1-114
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRangePicker(true)}
                  className="rounded-full h-8 text-xs gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  Pilih Range
                </Button>
              </div>
            ) : (
              <RangePicker
                fromNomor={fromNomor}
                toNomor={toNomor}
                onFromChange={setFromNomor}
                onToChange={setToNomor}
                onPlay={handlePlayRange}
                onCancel={() => setShowRangePicker(false)}
              />
            )}

            {queue.isActive && (
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Audio akan otomatis lanjut ke surah berikutnya. Tap X untuk berhenti.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RangePickerProps {
  fromNomor: number;
  toNomor: number;
  onFromChange: (n: number) => void;
  onToChange: (n: number) => void;
  onPlay: () => void;
  onCancel: () => void;
}

function RangePicker({ fromNomor, toNomor, onFromChange, onToChange, onPlay, onCancel }: RangePickerProps) {
  return (
    <div className="space-y-2 animate-fade-in">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Pilih rentang surah
      </p>
      <div className="grid grid-cols-2 gap-2">
        <RangeStepper label="Dari" value={fromNomor} onChange={onFromChange} />
        <RangeStepper label="Sampai" value={toNomor} onChange={onToChange} />
      </div>
      <p className="text-[11px] text-muted-foreground text-center tabular-nums">
        Total: <span className="font-bold text-foreground">{Math.abs(toNomor - fromNomor) + 1}</span> surah
      </p>
      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="rounded-full flex-1 h-8 text-xs"
        >
          Batal
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onPlay}
          className="rounded-full flex-1 h-8 text-xs gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700"
        >
          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
          Mulai
        </Button>
      </div>
    </div>
  );
}

interface RangeStepperProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
}

function RangeStepper({ label, value, onChange }: RangeStepperProps) {
  const decrement = () => onChange(Math.max(1, value - 1));
  const increment = () => onChange(Math.min(114, value + 1));

  return (
    <div className="rounded-xl border border-border/60 bg-card p-2">
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 text-center">
        {label}
      </p>
      <div className="flex items-center justify-between gap-1">
        <button
          onClick={decrement}
          disabled={value <= 1}
          className="w-7 h-7 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-muted-foreground"
          aria-label={`Kurangi ${label}`}
        >
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <span className="text-base font-bold text-foreground tabular-nums">{value}</span>
        <button
          onClick={increment}
          disabled={value >= 114}
          className="w-7 h-7 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-muted-foreground"
          aria-label={`Tambah ${label}`}
        >
          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}