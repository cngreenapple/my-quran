import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSurahList } from "@/hooks/use-surah-list";
import { useQuery } from "@tanstack/react-query";
import { fetchSurahDetail } from "@/lib/api";
import type { Ayat } from "@/types/quran";

export function VerseOfTheDay() {
  const { data: surahList } = useSurahList();
  const [seed, setSeed] = useState(0);

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const target = (() => {
    if (!surahList || surahList.length === 0) return null;
    const surahIdx = ((dayOfYear + seed) * 7 + 13) % surahList.length;
    const surah = surahList[surahIdx];
    const ayatNum = (((dayOfYear + seed) * 3 + 7) % surah.jumlahAyat) + 1;
    return { surah, ayatNum };
  })();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["verse-of-the-day", target?.surah.nomor, target?.ayatNum],
    queryFn: () => {
      if (!target) throw new Error("No target");
      return fetchSurahDetail(target.surah.nomor);
    },
    enabled: !!target,
    staleTime: 1000 * 60 * 60 * 6,
    refetchOnWindowFocus: false,
  });

  if (!target) return null;

  const ayat: Ayat | null = (() => {
    if (!detail) return null;
    return detail.ayat.find((a) => a.nomorAyat === target.ayatNum) ?? detail.ayat[0] ?? null;
  })();

  const arabicName = target.surah.nama.replace(/^سُورَةُ\s*/, "");

  return (
    <Link
      to={`/surat/${target.surah.nomor}#ayat-${ayat?.nomorAyat ?? target.ayatNum}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
    >
      <Card className="overflow-hidden border-violet-500/30 bg-gradient-to-br from-violet-500/8 via-violet-500/3 to-transparent hover:shadow-md hover:shadow-violet-500/10 transition-all group-active:scale-[0.99]">
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                Ayat Hari Ini
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
              {target.surah.namaLatin} • Ayat {ayat?.nomorAyat ?? target.ayatNum}
            </span>
          </div>

          {isLoading || !ayat ? (
            <div className="py-3 flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            </div>
          ) : (
            <>
              <p
                className="font-arabic text-right text-xl sm:text-2xl text-foreground leading-[2.2] line-clamp-3"
                dir="rtl"
                lang="ar"
              >
                {ayat.teksArab}
              </p>
              <p className="text-[11px] text-foreground/80 leading-relaxed mt-2 line-clamp-2">
                {ayat.teksIndonesia}
              </p>
              <div className="mt-2.5 pt-2.5 border-t border-violet-500/20 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground line-clamp-1 flex-1">
                  {target.surah.arti} • {target.surah.jumlahAyat} ayat
                </p>
                <BookOpen className="w-3 h-3 text-violet-500/60 shrink-0 ml-2" />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSeed((s) => s + 1);
            }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-violet-500/20 flex items-center justify-center text-violet-500/60 hover:text-violet-600 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Ayat lain"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </CardContent>
      </Card>
    </Link>
  );
}