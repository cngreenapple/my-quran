import { Link } from "react-router-dom";
import { Play, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLastRead } from "@/hooks/use-last-read";
import { useSurahList } from "@/hooks/use-surah-list";
import { showSuccess } from "@/utils/toast";

export function LastReadCard() {
  const { lastRead, clearLastRead } = useLastRead();
  const { data: surahList } = useSurahList();

  if (!lastRead) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-border/60 bg-muted/20 text-muted-foreground">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0" aria-hidden="true">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Terakhir Dibaca</p>
          <p className="text-xs">Belum ada — mulai baca dari surat pertama</p>
        </div>
      </div>
    );
  }

  const surah = surahList?.find((s) => s.nomor === lastRead.surahNumber);
  if (!surah) return null;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearLastRead();
    showSuccess("Riwayat dihapus");
  };

  return (
    <Link
      to={`/surat/${lastRead.surahNumber}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
    >
      <div className="relative flex items-center gap-3 p-3 pr-2 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/10 transition-all active:scale-[0.99]">
        {/* Play icon — hover scale */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-emerald-500/40 transition-all"
          aria-hidden="true"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider leading-none mb-1">
            Lanjutkan
          </p>
          <p className="text-sm font-bold text-foreground truncate leading-tight">
            {surah.namaLatin}{" "}
            <span className="text-muted-foreground font-normal">• Ayat {lastRead.ayatNumber}</span>
          </p>
        </div>

        {/* Hapus — proper IconButton dengan X icon + tap target yang cukup */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="shrink-0 h-7 px-2.5 gap-1 text-[10px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
          aria-label={`Hapus riwayat ${surah.namaLatin} ayat ${lastRead.ayatNumber}`}
        >
          <X className="w-3 h-3" aria-hidden="true" />
          <span className="hidden sm:inline">Hapus</span>
        </Button>
      </div>
    </Link>
  );
}