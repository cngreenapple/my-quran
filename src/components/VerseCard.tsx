import { memo, forwardRef, useState } from "react";
import { Share2, Bookmark, StickyNote } from "lucide-react";
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
    const notesCount = getNotesForAyat(surahNumber, ayat.nomorAyat).length;
    const isSurahPlaying = currentSurah === surahNumber;

    const handlePlaySurah = () => {
      if ("vibrate" in navigator) navigator.vibrate(10);
      if (isSurahPlaying) togglePlay();
      else play(surahNumber, surahName);
    };

    const handleShare = async () => {
      await shareVerseNative({ surahNumber, surahName, ayat });
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
          : `Ayat ${ayat.nomorAyat} disimpan`,
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
            "overflow-hidden border-border/60 scroll-mt-20 transition-colors",
            highlighted && "ring-2 ring-primary/40 border-primary/30",
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Number badge with audio */}
              <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30" aria-hidden="true" />
                  <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-primary/12 to-primary/5 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-primary tabular-nums">
                      {ayat.nomorAyat}
                    </span>
                  </div>
                </div>
                <AyatAudioButton
                  surahNumber={surahNumber}
                  ayatNumber={ayat.nomorAyat}
                  size="sm"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                <p
                  className="font-arabic text-right text-foreground leading-[2.4] text-xl sm:text-2xl"
                  dir="rtl"
                  lang="ar"
                >
                  {ayat.teksArab}
                </p>

                {showTransliteration && (
                  <p className="text-xs italic text-primary/80 dark:text-primary/90 leading-relaxed">
                    {ayat.teksLatin}
                  </p>
                )}

                <p className="text-sm text-foreground/80 leading-relaxed">
                  {ayat.teksIndonesia}
                </p>

                {showTafsir && (
                  <div
                    className={cn(
                      "rounded-lg p-3 border-l-2",
                      tafsirText
                        ? "bg-primary/5 border-primary"
                        : "bg-muted/50 border-muted-foreground/30",
                    )}
                  >
                    <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1.5">
                      Tafsir Kemenag
                    </p>
                    {tafsirText ? (
                      <p className="text-xs text-foreground/85 leading-relaxed">{tafsirText}</p>
                    ) : (
                      <p className="text-xs italic text-muted-foreground">Tafsir tidak tersedia.</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlaySurah}
                    type="button"
                    className={cn(
                      "h-7 px-2.5 gap-1 rounded-full text-[11px] font-medium",
                      isSurahPlaying
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={isSurahPlaying ? `Jeda surah ${surahName}` : `Putar surah ${surahName}`}
                    aria-pressed={isSurahPlaying}
                  >
                    <span className="text-[10px]">▶</span>
                    {isSurahPlaying ? "Jeda" : "Putar"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleBookmark}
                    type="button"
                    className={cn(
                      "h-7 px-2.5 gap-1 rounded-full text-[11px] font-medium",
                      bookmarked
                        ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={bookmarked ? "Hapus bookmark" : "Tambah bookmark"}
                    aria-pressed={bookmarked}
                  >
                    <Bookmark className={cn("w-3.5 h-3.5", bookmarked && "fill-current")} />
                    {bookmarked ? "Tersimpan" : "Simpan"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenNotes}
                    type="button"
                    className={cn(
                      "h-7 px-2.5 gap-1 rounded-full text-[11px] font-medium relative",
                      notesCount > 0
                        ? "text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-label={`Catatan untuk ayat ${ayat.nomorAyat}`}
                  >
                    <StickyNote className="w-3.5 h-3.5" />
                    Catatan{notesCount > 0 ? ` (${notesCount})` : ""}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    type="button"
                    className="h-7 px-2.5 gap-1 rounded-full text-[11px] font-medium text-muted-foreground hover:text-foreground ml-auto"
                    aria-label="Bagikan ayat"
                  >
                    <Share2 className="w-3.5 h-3.5" />
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