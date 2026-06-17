import { memo, forwardRef } from "react";
import { Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Ayat } from "@/types/quran";
import { shareVerseNative } from "@/utils/share";
import { cn } from "@/lib/utils";

interface VerseCardProps {
  surahNumber: number;
  surahName: string;
  ayat: Ayat;
  showTafsir: boolean;
  highlighted?: boolean;
  showTransliteration?: boolean;
  arabicFontSize?: "sm" | "base" | "lg" | "xl" | "2xl";
  translationFontSize?: "sm" | "base" | "lg";
}

const arabicSizeMap = {
  sm: "text-xl sm:text-2xl",
  base: "text-2xl sm:text-[1.65rem]",
  lg: "text-2xl sm:text-[1.75rem] md:text-3xl",
  xl: "text-3xl sm:text-4xl",
  "2xl": "text-4xl sm:text-5xl",
} as const;

const translationSizeMap = {
  sm: "text-sm sm:text-base",
  base: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
} as const;

export const VerseCard = memo(
  forwardRef<HTMLDivElement, VerseCardProps>(function VerseCard(
    {
      surahNumber,
      surahName,
      ayat,
      showTafsir,
      highlighted,
      showTransliteration = true,
      arabicFontSize = "lg",
      translationFontSize = "sm",
    },
    ref,
  ) {
    const tafsirText = ayat.tafsir?.kemenag?.teks;
    const arabicClass = arabicSizeMap[arabicFontSize];
    const translationClass = translationSizeMap[translationFontSize];

    const handleShare = async () => {
      await shareVerseNative({
        surahNumber,
        surahName,
        ayat,
      });
    };

    return (
      <Card
        ref={ref}
        id={`ayat-${ayat.nomorAyat}`}
        className={cn(
          "overflow-hidden border-border/60 scroll-mt-24 transition-colors",
          highlighted && "ring-2 ring-primary/40 border-primary/30",
        )}
      >
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Number Badge */}
            <div className="shrink-0 pt-1">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 group-hover:border-primary/50 transition-colors" />
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-bold text-primary">
                    {ayat.nomorAyat}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Arabic */}
              <p
                className={cn(
                  "font-arabic text-right text-foreground leading-[2.4]",
                  arabicClass,
                )}
                dir="rtl"
                lang="ar"
              >
                {ayat.teksArab}
              </p>

              {/* Latin */}
              {showTransliteration && (
                <p className="text-sm italic text-primary/80 dark:text-primary/90 leading-relaxed">
                  {ayat.teksLatin}
                </p>
              )}

              {/* Translation */}
              <p
                className={cn(
                  "text-foreground/80 leading-relaxed",
                  translationClass,
                )}
              >
                {ayat.teksIndonesia}
              </p>

              {/* Tafsir */}
              {showTafsir && (
                <div
                  className={cn(
                    "rounded-xl p-4 border-l-4",
                    tafsirText
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/50 border-muted-foreground/30",
                  )}
                >
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                    Tafsir Kemenag
                  </p>
                  {tafsirText ? (
                    <p className="text-sm text-foreground/85 leading-relaxed">
                      {tafsirText}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      Tafsir tidak tersedia untuk ayat ini.
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  type="button"
                  className="gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Bagikan ayat"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Bagikan</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }),
);