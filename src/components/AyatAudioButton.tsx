import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAyatAudio } from "@/contexts/ayat-audio-context";
import { cn } from "@/lib/utils";

interface AyatAudioButtonProps {
  surahNumber: number;
  ayatNumber: number;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "pill";
  className?: string;
}

export function AyatAudioButton({ surahNumber, ayatNumber, size = "sm", variant = "icon", className }: AyatAudioButtonProps) {
  const { playAyat, togglePlay, isCurrentAyat, isAyatPlaying, isAyatLoading, error } = useAyatAudio();
  const isCurrent = isCurrentAyat(surahNumber, ayatNumber);
  const playing = isAyatPlaying(surahNumber, ayatNumber);
  const loading = isAyatLoading(surahNumber, ayatNumber);
  const showError = isCurrent && !!error;

  const handleClick = () => {
    if ("vibrate" in navigator) navigator.vibrate(10);
    if (isCurrent) togglePlay();
    else playAyat(surahNumber, ayatNumber);
  };

  const sizeClasses = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-11 w-11" };
  const iconSizes = { sm: "w-3 h-3", md: "w-3.5 h-3.5", lg: "w-4 h-4" };

  if (variant === "pill") {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={handleClick} className={cn("gap-1 rounded-full transition-colors h-6 px-2", playing ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" : showError ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20" : "text-muted-foreground hover:text-foreground", className)} aria-label={playing ? `Jeda audio ayat ${ayatNumber}` : `Putar audio ayat ${ayatNumber}`} aria-pressed={playing}>
        {loading ? <Loader2 className={cn(iconSizes.sm, "animate-spin")} aria-hidden="true" /> : playing ? <Pause className={cn(iconSizes.sm, "fill-current")} aria-hidden="true" /> : showError ? <Volume2 className={iconSizes.sm} aria-hidden="true" /> : <Play className={cn(iconSizes.sm, "fill-current")} aria-hidden="true" />}
        <span className="text-[10px] font-medium">{loading ? "..." : playing ? "Jeda" : showError ? "Coba" : "Dengar"}</span>
      </Button>
    );
  }

  return (
    <Button type="button" variant="ghost" size="icon" onClick={handleClick} className={cn(sizeClasses[size], "rounded-full transition-all relative group", playing ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" : showError ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20" : "text-muted-foreground hover:text-foreground hover:bg-muted", className)} aria-label={playing ? `Jeda audio ayat ${ayatNumber}` : `Putar audio ayat ${ayatNumber}`} aria-pressed={playing}>
      {playing && (<><span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" aria-hidden="true" /><span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" aria-hidden="true" /></>)}
      {loading ? <Loader2 className={cn(iconSizes[size], "animate-spin relative z-10")} aria-hidden="true" /> : playing ? <Pause className={cn(iconSizes[size], "fill-current relative z-10")} aria-hidden="true" /> : showError ? <Volume2 className={cn(iconSizes[size], "relative z-10")} aria-hidden="true" /> : <Play className={cn(iconSizes[size], "fill-current relative z-10")} aria-hidden="true" />}
    </Button>
  );
}