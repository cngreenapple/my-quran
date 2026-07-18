import { BookOpen, ChevronDown, ChevronUp, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Surah } from "@/types/quran";

interface PlayerHeaderProps {
  currentSurah: Surah | null | undefined;
  currentIndex: number;
  totalInQueue: number;
  isActive: boolean;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onStop: () => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function PlayerHeader({
  currentSurah,
  currentIndex,
  totalInQueue,
  isActive,
  isDropdownOpen,
  onToggleDropdown,
  onStop,
  expanded,
  onToggleExpanded,
}: PlayerHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
          <BookOpen className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider leading-none">
            Murottal Full
          </p>
          {currentSurah ? (
            <>
              <p className="text-[11px] text-foreground font-semibold truncate leading-tight mt-0.5">
                {currentSurah.nomor}. {currentSurah.namaLatin} ({currentIndex + 1}/{totalInQueue})
              </p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                {currentSurah.arti} • {currentSurah.tempatTurun} • {currentSurah.jumlahAyat} ayat
              </p>
            </>
          ) : (
            <p className="text-[11px] text-foreground font-semibold truncate leading-tight mt-0.5">
              Pilih surah untuk didengar
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {isActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDropdown}
            className={cn(
              "rounded-full h-7 w-7",
              isDropdownOpen && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
            )}
            aria-label="Lihat daftar antrian surah"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            <List className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        )}
        {isActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            className="rounded-full h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label="Hentikan murottal"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpanded}
          className="rounded-full h-7 w-7"
          aria-label={expanded ? "Ciutkan panel" : "Buka panel play"}
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
  );
}