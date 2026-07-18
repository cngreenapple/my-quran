import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Ayat } from "@/types/quran";
import { AyatAudioButton } from "@/components/AyatAudioButton";

interface VerseCardFocusedProps {
  ayat: Ayat;
  /** Nomor surah (untuk audio button) */
  surahNumber: number;
  /** Nama surah (untuk audio button) */
  surahName: string;
  /** Tampilkan transliterasi latin di bawah ayat Arab */
  showTransliteration: boolean;
  /** 1-5 scale (1=sedang, 5=sangat besar). Default 3. */
  fontSize: 1 | 2 | 3 | 4 | 5;
}

const fontSizeMap: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "text-xl sm:text-2xl",
  2: "text-2xl sm:text-3xl",
  3: "text-3xl sm:text-4xl",
  4: "text-4xl sm:text-5xl",
  5: "text-5xl sm:text-6xl",
};

const lineHeightMap: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "leading-[2.2]",
  2: "leading-[2.4]",
  3: "leading-[2.6]",
  4: "leading-[2.8]",
  5: "leading-[3.0]",
};

/**
 * Tampilan ayat Al-Qur'an ala mushaf (traditional layout).
 *
 * Berbeda dari `VerseCard.tsx` (yang menampilkan audio button, terjemahan,
 * tafsir, dan action buttons), komponen ini HANYA menampilkan:
 * - Nomor ayat dalam ornament 8-pointed star (traditional mushaf design)
 * - Teks Arab (besar, prominent, RTL-aligned)
 * - Transliterasi latin (optional, default hidden)
 *
 * Cocok untuk mode baca fokus (immersive reading) tanpa distraction.
 */
export const VerseCardFocused = memo(function VerseCardFocused({
  ayat,
  surahNumber,
  surahName,
  showTransliteration,
  fontSize,
}: VerseCardFocusedProps) {
  return (
    <div
      id={`ayat-${ayat.nomorAyat}`}
      className="group flex items-start gap-3 sm:gap-5 py-5 sm:py-7 px-3 sm:px-5 border-b border-border/20 last:border-0 scroll-mt-24 transition-colors hover:bg-muted/30"
    >
      {/* Number badge + audio — traditional 8-pointed star ornament */}
      <div className="shrink-0 pt-1 sm:pt-2 flex flex-col items-center gap-1.5">
        <div className="relative w-9 h-9 sm:w-11 sm:h-11" aria-hidden="true">
          <svg
            viewBox="0 0 48 48"
            className="w-full h-full text-primary/30 group-hover:text-primary/45 transition-colors"
          >
            <path
              d="M24 0 L28 20 L48 24 L28 28 L24 48 L20 28 L0 24 L20 20 Z"
              fill="currentColor"
              opacity="0.55"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] sm:text-xs font-bold text-primary tabular-nums">
              {ayat.nomorAyat}
            </span>
          </div>
        </div>

        {/* Audio per ayat — muncul saat hover / playing */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-hidden="true">
          <AyatAudioButton
            surahNumber={surahNumber}
            ayatNumber={ayat.nomorAyat}
            size="sm"
          />
        </div>
      </div>

      {/* Arabic text + optional transliteration */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-arabic text-right text-foreground",
            fontSizeMap[fontSize],
            lineHeightMap[fontSize],
          )}
          dir="rtl"
          lang="ar"
        >
          {ayat.teksArab}
        </p>

        {showTransliteration && ayat.teksLatin && (
          <p
            className="text-xs sm:text-sm italic text-primary/70 dark:text-primary/80 leading-relaxed mt-3 sm:mt-4 text-right"
            dir="ltr"
          >
            {ayat.teksLatin}
          </p>
        )}
      </div>
    </div>
  );
});
