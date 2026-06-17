import { memo, forwardRef, useState } from "react";
import { Share2, Bookmark, StickyNote, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Ayat } from "@/types/quran";
import { shareVerseNative } from "@/utils/share";
import { showSuccess } from "@/utils/toast";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useNotes } from "@/hooks/use-notes";
import { AyatNotesDialog } from "@/components/AyatNotesDialog";
import { AyatAudioButton } from "@/components/AyatAudioButton";
import { useAudio } from "@/contexts/audio-context";
import { cn } from "@/lib/utils";

interface VerseCardProps {
  surahNumber: number;
  surahName: string;
  ayat: Ayat;
  showTafsir: boolean;
  highlighted?: boolean;
  showTransliteration?: boolean;
}

export const VerseCard = memo(
  forwardRef<HTMLDivElement, VerseCardProps>(function VerseCard(
    {
      surahNumber,
      surahName,
      ayat,
      showTafsir,
      highlighted,
      showTransliteration = true,
    },
    ref,
  ) {
    const tafsirText = ayat.tafsir?.kemenag?.teks;
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { getNotesForAyat } = useNotes();
    const { play, currentSurah, togglePlay } = useAudio();
    const [notesDialogOpen, setNotesDialogOpen] = useState(false);

    const bookmarked = isBookmarked(surahNumber, ayat.nomorAyat);
    const notesForThisAyat = getNotesForAyat(surahNumber, ayat.nomorAyat);
    const notesCount = notesForThisAyat.length;

    // Check if this surah is currently being played as full surah
    const isSurahPlaying = currentSurah === surahNumber;

    const handlePlaySurah = () => {
      if ("vibrate" in navigator) navigator.vibrate(10);
      if (isSurahPlaying) {
        togglePlay();
      } else {
        play(surahNumber, surahName);
      }
    };

    const handleShare = async () => {
      await shareVerseNative({
        surahNumber,
        surahName,
        ayat,
      });
    };

    const handleToggleBookmark = () => {
      if ("vibrate" in navigator) navigator.vibrate(10);
      toggleBookmark({
        surahNumber,
        surahName,
        ayatNumber: ayat.nomorAyat,
        previewText: ayat.teksIndonesia.slice(0, 120),
      });
      showSuccess(
        bookmarked
          ? `Bookmark QS. ${surahName}:${ayat.nomorAyat} dihapus`
          : `Ayat ${ayat.nomorAyat} disimpan ke bookmark`,
      );
    };

    const handleOpenNotes = () => {
      if ("vibrate" in navigator) navigator.vibrate(10);
      setNotesDialogOpen(true);
    };

    return (
      <>
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
              {/* Number Badge with Audio Play Button */}
              <div className="shrink-0 pt-1 flex flex-col items-center gap-1.5">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 group-hover:border-primary/50 transition-colors" />
                  <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      {ayat.nomorAyat}
                    </span>
                  </div>
                </div>
                {/* Per-ayat audio button */}
                <AyatAudioButton
                  surahNumber={surahNumber}
                  ayatNumber={ayat.nomorAyat}
                  size="sm"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Arabic */}
                <p
                  className="font-arabic text-right text-foreground leading-[2.4] text-2xl sm:text-[1.75rem] md:text-3xl"
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
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
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
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlaySurah}
                    type="button"
                    className={cn(
                      "gap-1.5 rounded-full transition-colors",
                      isSurahPlaying
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={isSurahPlaying ? `Jeda surah ${surahName}` : `Putar surah ${surahName} full`}
                    aria-pressed={isSurahPlaying}
                  >
                    <Play
                      className={cn(
                        "w-4 h-4",
                        isSurahPlaying ? "fill-current animate-pulse" : "fill-current",
                      )}
                    />
                    <span className="text-xs font-medium">
                      {isSurahPlaying ? "Jeda Surah" : "Putar Surah"}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleBookmark}
                    type="button"
                    className={cn(
                      "gap-1.5 rounded-full transition-colors",
                      bookmarked
                        ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={bookmarked ? "Hapus bookmark" : "Tambah bookmark"}
                    aria-pressed={bookmarked}
                  >
                    <Bookmark
                      className={cn("w-4 h-4", bookmarked && "fill-current")}
                    />
                    <span className="text-xs font-medium">
                      {bookmarked ? "Tersimpan" : "Bookmark"}
                    </span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenNotes}
                    type="button"
                    className={cn(
                      "gap-1.5 rounded-full relative transition-colors",
                      notesCount > 0
                        ? "text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={`Catatan untuk ayat ${ayat.nomorAyat}`}
                  >
                    <StickyNote className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Catatan{notesCount > 0 ? ` (${notesCount})` : ""}
                    </span>
                  </Button>

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

        <AyatNotesDialog
          open={notesDialogOpen}
          onOpenChange={setNotesDialogOpen}
          surahNumber={surahNumber}
          surahName={surahName}
          ayat={ayat}
        />
      </>
    );
  }),
);