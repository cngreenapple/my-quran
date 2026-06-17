import { memo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { Surah } from "@/types/quran";
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
      <mark
        key={i}
        className="bg-amber-200 dark:bg-amber-900/50 text-foreground rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function SurahCardComponent({ surah, query = "" }: SurahCardProps) {
  const arabicName = surah.nama.replace(/^سُورَةُ\s*/, "");
  return (
    <Link
      to={`/surat/${surah.nomor}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
    >
      <Card
        className={cn(
          "overflow-hidden border-border/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200",
          "group-active:scale-[0.98]",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Number Badge */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20 ring-2 ring-emerald-100 dark:ring-emerald-900/50">
                {surah.nomor}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {highlightText(surah.namaLatin, query)}
              </h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {highlightText(surah.arti, query)}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
                    surah.tempatTurun === "Mekah"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
                  )}
                >
                  {surah.tempatTurun}
                </span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {surah.jumlahAyat} Ayat
                </span>
              </div>
            </div>

            {/* Arabic Name */}
            <div className="shrink-0 text-right pl-2">
              <p
                className="font-arabic text-2xl sm:text-3xl text-primary leading-none"
                dir="rtl"
              >
                {arabicName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export const SurahCard = memo(SurahCardComponent);