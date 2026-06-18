import { Link } from "react-router-dom";
import { Play, BookOpen } from "lucide-react";
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
      <div className="flex items-center gap-2.5 p-2.5 pr-2 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent hover:border-primary/50 transition-all active:scale-[0.99]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30 shrink-0" aria-hidden="true">
          <Play className="w-4 h-4 fill-current" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-primary uppercase tracking-wider leading-none mb-0.5">
            Lanjutkan
          </p>
          <p className="text-sm font-bold text-foreground truncate leading-tight">
            {surah.namaLatin} <span className="text-muted-foreground font-normal">• Ayat {lastRead.ayatNumber}</span>
          </p>
        </div>
        <button
          onClick={handleClear}
          className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-background/50"
          aria-label="Hapus riwayat"
        >
          Hapus
        </button>
      </div>
    </Link>
  );
}