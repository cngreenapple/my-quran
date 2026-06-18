import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, MapPin, BookOpen, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { VerseCard } from "@/components/VerseCard";
import { SurahDetailSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useSurahDetail } from "@/hooks/use-surah-detail";
import { useLastRead } from "@/hooks/use-last-read";
import { useReadingStats } from "@/hooks/use-reading-stats";
import { useAudio } from "@/contexts/audio-context";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";

interface SuratDetailProps {
  onMenuClick: () => void;
}

export default function SuratDetail({ onMenuClick }: SuratDetailProps) {
  const { id } = useParams<{ id: string }>();
  const nomor = Number(id);
  const isValidNomor = !isNaN(nomor) && nomor >= 1 && nomor <= 114;

  const { data, isLoading, isError, refetch } = useSurahDetail(isValidNomor ? nomor : 0);
  const { updateLastRead } = useLastRead();
  const { trackSurahOpen, trackAyatRead } = useReadingStats();
  const { play, currentSurah, togglePlay } = useAudio();
  const { settings } = useAppSettings();
  const [activeTab, setActiveTab] = useState<"ayat" | "tafsir">("ayat");
  const readAyatsRef = useRef<Set<number>>(new Set());

  useDocumentTitle(data ? `${data.nomor}. ${data.namaLatin}` : undefined);

  useEffect(() => {
    if (data) {
      updateLastRead({ surahNumber: data.nomor, surahName: data.namaLatin, ayatNumber: 1 });
      trackSurahOpen(data.nomor, data.namaLatin);
    }
  }, [data, updateLastRead, trackSurahOpen]);

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
      { threshold: 0.3 },
    );
    const elements = document.querySelectorAll('[id^="ayat-"]');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data, trackAyatRead]);

  useEffect(() => {
    if (!data) return;
    const hash = window.location.hash;
    if (hash.startsWith("#ayat-")) {
      const ayatNum = parseInt(hash.replace("#ayat-", ""), 10);
      if (!isNaN(ayatNum)) {
        setTimeout(() => {
          const element = document.getElementById(`ayat-${ayatNum}`);
          if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  }, [data]);

  const isCurrentPlaying = currentSurah === nomor;
  const handlePlayToggle = () => {
    if (!data) return;
    if (isCurrentPlaying) togglePlay();
    else play(data.nomor, data.namaLatin);
  };

  if (!isValidNomor) {
    return (
      <div className="min-h-dvh bg-background">
        <Header onMenuClick={onMenuClick} />
        <main className="container mx-auto px-3 py-4 max-w-3xl">
          <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full" size="sm">
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-1.5" />Kembali</Link>
          </Button>
          <ErrorState title="Nomor Surat Tidak Valid" message="Nomor surat harus antara 1 sampai 114." />
        </main>
        <AudioPlayer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <Header onMenuClick={onMenuClick} />
        <main className="container mx-auto px-3 py-4 max-w-3xl">
          <SurahDetailSkeleton />
        </main>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-dvh bg-background">
        <Header onMenuClick={onMenuClick} />
        <main className="container mx-auto px-3 py-4 max-w-3xl">
          <Button variant="ghost" asChild className="mb-3 -ml-2" size="sm">
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Kembali</Link>
          </Button>
          <ErrorState title="Gagal Memuat Surat" message="Terjadi kesalahan. Silakan coba lagi." onRetry={() => refetch()} />
        </main>
        <AudioPlayer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="surah-title">
        <Button variant="ghost" asChild className="mb-2.5 -ml-2 rounded-full h-8" size="sm">
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="text-xs">Kembali</span>
          </Link>
        </Button>

        {/* Hero - compact */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 shadow-lg shadow-emerald-500/20 mb-4">
          <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="surah-pattern" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
                  <path d="M22 0 L44 22 L22 44 L0 22 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#surah-pattern)" />
            </svg>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[9px] font-bold uppercase tracking-wider">
                Surah {data.nomor}
              </div>
              <Button
                onClick={handlePlayToggle}
                size="sm"
                className="h-7 px-2.5 rounded-full gap-1.5 text-[11px] font-semibold bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
                aria-label={isCurrentPlaying ? "Jeda audio" : "Putar audio murottal"}
              >
                <Play className={cn("w-3 h-3", isCurrentPlaying && "animate-pulse")} aria-hidden="true" />
                {isCurrentPlaying ? "Putar" : "Putar Full"}
              </Button>
            </div>
            <div className="text-center mb-3">
              <p className="font-arabic text-4xl sm:text-5xl mb-2 leading-none" dir="rtl" lang="ar" aria-label={`Nama Arab: ${data.nama}`}>
                {data.nama.replace(/^سُورَةُ\s*/, "")}
              </p>
              <h1 id="surah-title" className="text-xl sm:text-2xl font-bold leading-tight">
                {data.namaLatin}
              </h1>
              <p className="text-emerald-50/85 text-xs italic mt-0.5">{data.arti}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-50/85 mb-3">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {data.tempatTurun}
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-50/50" />
              <span className="tabular-nums">{data.jumlahAyat} Ayat</span>
            </div>
            {data.deskripsi && (
              <p className="text-[11px] sm:text-xs text-emerald-50/75 leading-relaxed text-center max-w-2xl mx-auto border-t border-white/10 pt-2.5">
                {data.deskripsi}
              </p>
            )}
          </div>
        </section>

        {/* Bismillah (compact) */}
        {data.nomor !== 1 && data.nomor !== 9 && (
          <div className="text-center mb-4 py-2.5 border-y border-border/60">
            <p className="font-arabic text-2xl text-primary leading-relaxed" dir="rtl" lang="ar" aria-label="Bismillahirrahmanirrahim">
              بِسْمِ اللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ayat" | "tafsir")} className="mb-3">
          <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 h-10 rounded-full bg-muted p-0.5" aria-label="Pilihan tampilan ayat">
            <TabsTrigger value="ayat" className="rounded-full gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Ayat
            </TabsTrigger>
            <TabsTrigger value="tafsir" className="rounded-full gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
              Tafsir
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ayat" className="space-y-3 mt-3 animate-fade-in">
            {data.ayat.map((ayat) => (
              <VerseCard key={ayat.nomorAyat} surahNumber={data.nomor} surahName={data.namaLatin} ayat={ayat} showTafsir={false} showTransliteration={settings.showTransliteration} />
            ))}
          </TabsContent>
          <TabsContent value="tafsir" className="space-y-3 mt-3 animate-fade-in">
            {data.ayat.map((ayat) => (
              <VerseCard key={ayat.nomorAyat} surahNumber={data.nomor} surahName={data.namaLatin} ayat={ayat} showTafsir={true} showTransliteration={settings.showTransliteration} />
            ))}
          </TabsContent>
        </Tabs>
      </main>
      <AudioPlayer />
    </div>
  );
}