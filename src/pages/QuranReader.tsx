import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Settings, X, Maximize2, ChevronLeft, ChevronRight,
  Play, Pause, Loader2, Volume2, Eye, EyeOff, Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerseCardFocused } from "@/components/VerseCardFocused";
import { useSurahDetail } from "@/hooks/use-surah-detail";
import { useLastRead } from "@/hooks/use-last-read";
import { useAudio } from "@/contexts/audio-context";
import { useReadingStats } from "@/hooks/use-reading-stats";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useSurahList } from "@/hooks/use-surah-list";
import { ErrorState } from "@/components/ErrorState";
import { SurahDetailSkeleton } from "@/components/LoadingSkeleton";
import { cn } from "@/lib/utils";

type FontSize = 1 | 2 | 3 | 4 | 5;

/**
 * Full-page focused reading mode untuk Al-Qur'an.
 *
 * Karakteristik:
 * - Fokus ke ayat Arab saja (tidak ada terjemahan, tafsir, action buttons)
 * - Mushaf-style layout (nomor dalam ornament 8-pointed star)
 * - Chrome (header + bottom nav) auto-hide setelah 4 detik inactivity
 * - Tap area kosong untuk toggle chrome (immersive mode)
 * - Settings panel: font size (1-5), transliterasi toggle, fullscreen
 * - Prev/next surah navigation (ganti surah dari halaman reader)
 * - Audio play/pause tetap tersedia (opsional, untuk listening sambil baca)
 *
 * Diakses dari route `/baca/:id` (terpisah dari SuratDetail untuk full immersion).
 */
export default function QuranReader() {
  const { id } = useParams<{ id: string }>();
  const nomor = Number(id);
  const isValidNomor = !isNaN(nomor) && nomor >= 1 && nomor <= 114;

  const { data, isLoading, isError, refetch } = useSurahDetail(isValidNomor ? nomor : 0);
  const { data: surahList } = useSurahList();
  const { updateLastRead } = useLastRead();
  const { trackSurahOpen, trackAyatRead } = useReadingStats();
  const audio = useAudio();
  const readAyatsRef = useRef<Set<number>>(new Set());

  const [fontSize, setFontSize] = useState<FontSize>(3);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const chromeTimeoutRef = useRef<number | null>(null);

  useDocumentTitle(data ? `📖 ${data.nomor}. ${data.namaLatin}` : undefined);

  /**
   * Set `data-mode="reader"` di <html> supaya CSS rule
   * `html[data-mode="reader"] #root { padding-top: 0 }` di globals.css
   * mengoverride default 60px padding-top. Ini supaya reader pakai
   * full viewport height (tidak ada gap kosong di atas).
   */
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.mode = "reader";
    return () => {
      delete html.dataset.mode;
    };
  }, []);

  // Update last read
  useEffect(() => {
    if (data) {
      updateLastRead({ surahNumber: data.nomor, surahName: data.namaLatin, ayatNumber: 1 });
      trackSurahOpen(data.nomor, data.namaLatin);
    }
  }, [data, updateLastRead, trackSurahOpen]);

  // IntersectionObserver — track ayat read untuk statistik
  useEffect(() => {
    if (!data) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const ayatNum = parseInt(entry.target.id.replace("ayat-", ""), 10);
            if (!isNaN(ayatNum) && !readAyatsRef.current.has(ayatNum)) {
              readAyatsRef.current.add(ayatNum);
              trackAyatRead(data.nomor, data.namaLatin, ayatNum);
            }
          }
        });
      },
      { threshold: 0.5 },
    );
    const elements = document.querySelectorAll('[id^="ayat-"]');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data, trackAyatRead]);

  // Auto-hide chrome after inactivity (4 detik tanpa aktivitas → hide)
  useEffect(() => {
    const resetTimer = () => {
      setChromeVisible(true);
      if (chromeTimeoutRef.current) clearTimeout(chromeTimeoutRef.current);
      chromeTimeoutRef.current = window.setTimeout(() => {
        // Hanya hide kalau user tidak sedang buka settings panel
        if (!settingsOpen) setChromeVisible(false);
      }, 4000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      if (chromeTimeoutRef.current) clearTimeout(chromeTimeoutRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [settingsOpen]);

  // Fullscreen API
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("[QuranReader] Fullscreen error", err);
    }
  };

  // Tap empty area to toggle chrome
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Skip kalau tap pada interactive elements
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("[role='slider']") ||
      target.closest("[role='radio']") ||
      target.closest(".reader-card")
    ) return;
    e.preventDefault();
    setChromeVisible((v) => !v);
  };

  // Loading & error states
  if (!isValidNomor) {
    return (
      <div className="min-h-dvh bg-background">
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Button variant="ghost" asChild className="mb-3">
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Kembali</Link>
          </Button>
          <ErrorState title="Nomor Surat Tidak Valid" message="Nomor surat harus antara 1 sampai 114." />
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <main className="container mx-auto px-3 py-4 max-w-3xl">
          <SurahDetailSkeleton />
        </main>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-dvh bg-background">
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Button variant="ghost" asChild className="mb-3">
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Kembali</Link>
          </Button>
          <ErrorState title="Gagal Memuat Surat" message="Terjadi kesalahan. Silakan coba lagi." onRetry={() => refetch()} />
        </main>
      </div>
    );
  }

  const prevSurah = surahList?.find((s) => s.nomor === nomor - 1);
  const nextSurah = surahList?.find((s) => s.nomor === nomor + 1);
  const isCurrentPlaying = audio.currentSurah === nomor;
  const isPlaying = audio.isPlaying && isCurrentPlaying;

  return (
    <div
      className="min-h-dvh bg-background relative"
      onClick={handleTap}
    >
      {/* Top chrome (header) — auto-hide */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out",
          chromeVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none",
        )}
      >
        <div className="bg-background/90 backdrop-blur-md border-b border-border/60">
          <div className="container mx-auto flex items-center justify-between gap-2 px-3 py-2.5 max-w-3xl">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full h-9 w-9"
              aria-label="Kembali ke halaman surat"
            >
              <Link to={`/surat/${data.nomor}`}>
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>

            <div className="flex-1 min-w-0 text-center">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider leading-none">
                Surah {data.nomor}
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {data.namaLatin}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSettingsOpen((v) => !v);
              }}
              className={cn(
                "rounded-full h-9 w-9 shrink-0",
                settingsOpen && "bg-muted text-foreground",
              )}
              aria-label="Pengaturan tampilan"
              aria-expanded={settingsOpen}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings panel — floating dropdown dari header */}
      {settingsOpen && (
        <div
          className={cn(
            "fixed right-3 top-14 z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-card shadow-2xl p-4 space-y-3 animate-fade-in",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground">Pengaturan Tampilan</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(false)}
              className="rounded-full h-7 w-7"
              aria-label="Tutup pengaturan"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>

          {/* Font size control */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Type className="w-3 h-3" aria-hidden="true" />
              Ukuran Teks Arab
            </p>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Ukuran teks">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setFontSize(n)}
                  className={cn(
                    "flex-1 h-9 rounded-lg border-2 transition-all flex items-center justify-center font-bold",
                    fontSize === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                  role="radio"
                  aria-checked={fontSize === n}
                  aria-label={`Ukuran ${n}`}
                >
                  <span className={cn(
                    "tabular-nums",
                    n === 1 && "text-xs",
                    n === 2 && "text-sm",
                    n === 3 && "text-base",
                    n === 4 && "text-lg",
                    n === 5 && "text-xl",
                  )}>A</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transliteration toggle */}
          <button
            onClick={() => setShowTransliteration((v) => !v)}
            className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-muted transition-colors"
            aria-pressed={showTransliteration}
          >
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
              {showTransliteration ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Transliterasi Latin
            </span>
            <div className={cn(
              "w-8 h-5 rounded-full p-0.5 transition-colors shrink-0",
              showTransliteration ? "bg-primary" : "bg-muted",
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full bg-white shadow transition-transform",
                showTransliteration && "translate-x-3",
              )} />
            </div>
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
              Mode Layar Penuh
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">F</span>
          </button>

          <div className="pt-2 border-t border-border/60">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              💡 Tap area kosong untuk menyembunyikan toolbar. Chrome akan muncul lagi saat scroll/tap.
            </p>
          </div>
        </div>
      )}

      {/* Main reading area */}
      <main
        className="container mx-auto px-3 py-3 pb-32 max-w-3xl"
        aria-labelledby="reader-title"
      >
        {/* Surah title (collapses with chrome) */}
        <div
          className={cn(
            "text-center mb-6 pt-2 transition-opacity duration-300",
            chromeVisible ? "opacity-100" : "opacity-0 h-0 mb-0 overflow-hidden",
          )}
        >
          <p
            className="font-arabic text-4xl sm:text-5xl text-foreground leading-none mb-2"
            dir="rtl"
            lang="ar"
          >
            {data.nama.replace(/^سُورَةُ\s*/, "")}
          </p>
          <h1
            id="reader-title"
            className="text-lg sm:text-xl font-bold text-foreground"
          >
            {data.namaLatin}
          </h1>
          <p className="text-xs text-muted-foreground italic mt-0.5">
            {data.arti} • {data.jumlahAyat} ayat
          </p>
        </div>

        {/* Bismillah (collapses with chrome) */}
        {data.nomor !== 1 && data.nomor !== 9 && (
          <div
            className={cn(
              "text-center mb-6 py-4 border-y border-border/40 transition-opacity duration-300",
              chromeVisible ? "opacity-100" : "opacity-0 h-0 mb-0 py-0 overflow-hidden border-0",
            )}
          >
            <p
              className="font-arabic text-2xl sm:text-3xl text-primary leading-relaxed"
              dir="rtl"
              lang="ar"
            >
              بِسْمِ اللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        {/* Verses - mushaf style */}
        <article
          className="reader-card bg-card rounded-3xl border border-border/40 overflow-hidden shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {data.ayat.map((ayat) => (
            <VerseCardFocused
              key={ayat.nomorAyat}
              ayat={ayat}
              surahNumber={data.nomor}
              surahName={data.namaLatin}
              showTransliteration={showTransliteration}
              fontSize={fontSize}
            />
          ))}
        </article>

        {/* Bottom nav (collapses with chrome) */}
        <div
          className={cn(
            "mt-6 flex items-center justify-between gap-2 transition-opacity duration-300",
            chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none h-0 mt-0 overflow-hidden",
          )}
        >
          <Button
            variant="outline"
            onClick={() => prevSurah && window.location.assign(`/baca/${prevSurah.nomor}`)}
            disabled={!prevSurah}
            className="rounded-full gap-1 text-xs flex-1"
            size="sm"
          >
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{prevSurah?.namaLatin || "—"}</span>
          </Button>

          <Button
            variant={isPlaying ? "default" : "outline"}
            onClick={() => {
              if (isCurrentPlaying) audio.togglePlay();
              else audio.play(data.nomor, data.namaLatin);
            }}
            className={cn(
              "rounded-full gap-1 text-xs shrink-0",
              isPlaying && "bg-primary text-primary-foreground",
            )}
            size="sm"
            aria-label={isPlaying ? "Jeda audio" : "Putar audio murottal"}
          >
            {audio.isLoadingAudio && isCurrentPlaying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{isPlaying ? "Jeda" : "Putar"}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => nextSurah && window.location.assign(`/baca/${nextSurah.nomor}`)}
            disabled={!nextSurah}
            className="rounded-full gap-1 text-xs flex-1"
            size="sm"
          >
            <span className="truncate">{nextSurah?.namaLatin || "—"}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </Button>
        </div>

        {/* Hint saat chrome hidden */}
        <div
          className={cn(
            "text-center mt-8 mb-4 text-[10px] text-muted-foreground transition-opacity duration-300",
            chromeVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <p>📖 Tap area kosong untuk menyembunyikan toolbar</p>
        </div>
      </main>

      {/* Floating indicator — saat chrome hidden & audio playing */}
      {!chromeVisible && audio.isPlaying && isCurrentPlaying && (
        <div
          className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center pointer-events-none animate-fade-in"
          aria-hidden="true"
        >
          <Volume2 className="w-5 h-5 animate-pulse" />
        </div>
      )}
    </div>
  );
}