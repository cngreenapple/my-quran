import { Link } from "react-router-dom";
import { Play, BookOpen, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLastRead } from "@/hooks/use-last-read";
import { useSurahList } from "@/hooks/use-surah-list";
import { showSuccess } from "@/utils/toast";

export function LastReadCard() {
  const { lastRead, clearLastRead } = useLastRead();
  const { data: surahList } = useSurahList();

  if (!lastRead) return null;
  const surah = surahList?.find((s) => s.nomor === lastRead.surahNumber);
  if (!surah) return null;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearLastRead();
    showSuccess("Riwayat terakhir dibaca dihapus");
  };

  return (
    <Link
      to={`/surat/${lastRead.surahNumber}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-3xl"
    >
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group-active:scale-[0.99]">
        <CardContent className="p-5 relative">
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/60 hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Hapus riwayat"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Terakhir Dibaca
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                {surah.namaLatin}
              </h3>
              <p className="text-xs text-muted-foreground">
                Ayat {lastRead.ayatNumber} • {surah.arti}
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0 rounded-full gap-1.5 shadow-md shadow-primary/20"
              asChild
            >
              <span>
                <Play className="w-3.5 h-3.5 fill-current" />
                Lanjutkan
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}