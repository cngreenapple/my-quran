import { memo } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Surah } from "@/types/quran";
import { useReadingStats } from "@/hooks/use-reading-stats";
import { cn } from "@/lib/utils";

interface SurahCardProps {
  surah: Surah;
  query?: string;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-amber-200/80 dark:bg-amber-900/50 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function SurahCardComponent({ surah, query = "" }: SurahCardProps) {
  const { stats } = useReadingStats();
  const arabicName = surah.nama.replace(/^سُورَةُ\s*/, "");
  const isOpened = stats.surahsOpened.includes(surah.nomor);

  return (
    <Link
      to={`/surat/${surah.nomor}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
    >
      <Card
        className={cn(
          "overflow-hidden border-border/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all active:scale-[0.98]",
          isOpened && "ring-1 ring-emerald-500/25",
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-sm",
                isOpened
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/20",
              )}
              aria-hidden="true"
            >
              {isOpened ? <Check className="w-4 h-4" /> : surah.nomor}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[13px] text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                {highlightText(surah.namaLatin, query)}
              </h3>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-none">
                {highlightText(surah.arti, query)}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                    surah.tempatTurun === "Mekah"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
                  )}
                >
                  {surah.tempatTurun}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium tabular-nums">
                  {surah.jumlahAyat} ayat
                </span>
              </div>
            </div>

            <p
              className="font-arabic text-xl text-primary leading-none shrink-0 pl-1"
              dir="rtl"
            >
              {arabicName}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export const SurahCard = memo(SurahCardComponent);