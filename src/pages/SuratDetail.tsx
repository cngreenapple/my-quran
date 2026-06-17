import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  MapPin,
  Hash,
  BookOpen,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function SuratDetail() {
  const { id } = useParams<{ id: string }>();
  const nomor = Number(id);
  const isValidNomor = !isNaN(nomor) && nomor >= 1 && nomor <= 114;

  const { data, isLoading, isError, refetch } = useSurahDetail(isValidNomor ? nomor : 0);
  const { updateLastRead } = useLastRead();
  const { trackSurahOpen, trackAyatRead } = useReadingStats();
  const { play, currentSurah, togglePlay } = useAudio();
  const { settings } = useAppSettings();
  const [activeTab, setActiveTab] = useState<"ayat" | "tafsir">("ayat");
  const [readAyats, setReadAyats] = useState<Set<number>>(new Set());

  // Update document title for SEO + UX (browser tab)
  useDocumentTitle(data ? `${data.nomor}. ${data.namaLatin}` : undefined);

  // Update last read + track surah open when data loads
  useEffect(() => {
    if (data) {
      updateLastRead({
        surahNumber: data.nomor,
        surahName: data.namaLatin,
        ayatNumber: 1,
      });
      trackSurahOpen(data.nomor, data.namaLatin);
    }
  }, [data, updateLastRead, trackSurahOpen]);

  // Track ayat reads via IntersectionObserver
  useEffect(() => {
    if (!data) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const ayatNum = parseInt(
              entry.target.id.replace("ayat-", ""),
              10,
            );
            if (!isNaN(ayatNum) && !readAyats.has(ayatNum)) {
              setReadAyats((prev) => new Set(prev).add(ayatNum));
              trackAyatRead(data.nomor, data.namaLatin, ayatNum);
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    // Observe all ayat elements
    const elements = document.querySelectorAll('[id^="ayat-"]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [data, readAyats, trackAyatRead]);

  // Scroll to ayat from hash
  useEffect(() => {
    if (!data) return;
    const hash = window.location.hash;
    if (hash.startsWith("#ayat-")) {
      const ayatNum = parseInt(hash.replace("#ayat-", ""), 10);
      if (!isNaN(ayatNum)) {
        setTimeout(() => {
          const element = document.getElementById(`ayat-${ayatNum}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 300);
      }
    }
  }, [data]);

  const isCurrentPlaying = currentSurah === nomor;

  const handlePlayToggle = () => {
    if (!data) return;
    if (isCurrentPlaying) {
      togglePlay();
    } else {
      play(data.nomor, data.namaLatin);
    }
  };

  if (!isValidNomor) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-3xl">
          <Button variant="ghost" asChild className="mb-4 -ml-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <ErrorState
            title="Nomor Surat Tidak Valid"
            message="Nomor surat harus antara 1 sampai 114. Silakan pilih surat dari daftar."
          />
        </main>
        <AudioPlayer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-3xl">
          <SurahDetailSkeleton />
        </main>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-3xl">
          <Button variant="ghost" asChild className="mb-4 -ml-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <ErrorState
            title="Gagal Memuat Surat"
            message="Terjadi kesalahan saat memuat detail surat. Silakan coba lagi."
            onRetry={() => refetch()}
          />
        </main>
        <AudioPlayer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background bg-mesh dark:bg-mesh-dark">
      <Header />

      <main
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl"
        aria-labelledby="surah-title"
      >
        {/* Back button */}
        <Button
          variant="ghost"
          asChild
          className="mb-4 -ml-2 rounded-full"
          size="sm"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Kembali
          </Link>
        </Button>

        {/* Surah Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-xl shadow-emerald-500/20 mb-6">
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="surah-pattern"
                  x="0"
                  y="0"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M25 5 L45 25 L25 45 L5 25 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#surah-pattern)" />
            </svg>
          </div>

          <div className="relative">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                Surah {data.nomor}
              </div>
              <Button
                onClick={handlePlayToggle}
                size="sm"
                className="rounded-full gap-2 shadow-lg bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
                aria-label={isCurrentPlaying ? "Jeda audio" : "Putar audio murottal"}
              >
                <Play
                  className={cn("w-3.5 h-3.5", isCurrentPlaying && "animate-pulse")}
                  aria-hidden="true"
                />
                {isCurrentPlaying ? "Putar Audio" : "Putar Full"}
              </Button>
            </div>

            <div className="text-center mb-4">
              <p
                className="font-arabic text-5xl sm:text-6xl mb-3 leading-tight"
                dir="rtl"
                lang="ar"
                aria-label={`Nama Arab: ${data.nama}`}
              >
                {data.nama.replace(/^سُورَةُ\s*/, "")}
              </p>
              <h1 id="surah-title" className="text-2xl sm:text-3xl font-bold mb-1">
                {data.namaLatin}
              </h1>
              <p className="text-emerald-50/90 text-sm italic">{data.arti}</p>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-emerald-50/90 mb-4">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                {data.tempatTurun}
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-50/50" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" aria-hidden="true" />
                {data.jumlahAyat} Ayat
              </span>
            </div>

            {data.deskripsi && (
              <div className="text-xs sm:text-sm text-emerald-50/80 leading-relaxed text-center max-w-2xl mx-auto border-t border-white/10 pt-4">
                {data.deskripsi}
              </div>
            )}
          </div>
        </section>

        {/* Bismillah - only for surah except Al-Fatihah and At-Taubah */}
        {data.nomor !== 1 && data.nomor !== 9 && (
          <div className="text-center mb-6 py-4 border-y border-border/60">
            <p
              className="font-arabic text-3xl text-primary leading-relaxed"
              dir="rtl"
              lang="ar"
              aria-label="Bismillahirrahmanirrahim"
            >
              بِسْمِ اللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "ayat" | "tafsir")}
          className="mb-4"
        >
          <TabsList
            className="grid w-full max-w-sm mx-auto grid-cols-2 h-11 rounded-full bg-muted p-1"
            aria-label="Pilihan tampilan ayat"
          >
            <TabsTrigger
              value="ayat"
              className="rounded-full gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Ayat
            </TabsTrigger>
            <TabsTrigger
              value="tafsir"
              className="rounded-full gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
              Tafsir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ayat" className="space-y-4 mt-4 animate-fade-in">
            {data.ayat.map((ayat) => (
              <VerseCard
                key={ayat.nomorAyat}
                surahNumber={data.nomor}
                surahName={data.namaLatin}
                ayat={ayat}
                showTafsir={false}
                showTransliteration={settings.showTransliteration}
              />
            ))}
          </TabsContent>

          <TabsContent value="tafsir" className="space-y-4 mt-4 animate-fade-in">
            {data.ayat.map((ayat) => (
              <VerseCard
                key={ayat.nomorAyat}
                surahNumber={data.nomor}
                surahName={data.namaLatin}
                ayat={ayat}
                showTafsir={true}
                showTransliteration={settings.showTransliteration}
              />
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <AudioPlayer />
    </div>
  );
}