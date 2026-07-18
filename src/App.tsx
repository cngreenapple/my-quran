import { useState, Suspense, lazy, useEffect, useRef, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AudioProvider, useAudio } from "@/contexts/audio-context";
import { AyatAudioProvider, useAyatAudio } from "@/contexts/ayat-audio-context";
import { LastReadProvider } from "@/hooks/use-last-read";
import { DzikirProvider } from "@/hooks/use-dzikir-counter";
import { TasbihProvider } from "@/hooks/use-tasbih-counter";
import { ReadingStatsProvider } from "@/hooks/use-reading-stats";
import { AppSettingsProvider } from "@/hooks/use-app-settings";
import { BookmarkProvider } from "@/hooks/use-bookmarks";
import { NotesProvider } from "@/hooks/use-notes";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { AppDrawer } from "@/components/AppDrawer";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PWAStatusBar } from "@/components/PWAStatusBar";
import { SurahListSkeleton } from "@/components/LoadingSkeleton";
import { useServiceWorker } from "@/hooks/use-service-worker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false, retry: 1 },
  },
});

const Index = lazy(() => import("./pages/Index"));
const SuratDetail = lazy(() => import("./pages/SuratDetail"));
const QuranReader = lazy(() => import("./pages/QuranReader"));
const Settings = lazy(() => import("./pages/Settings"));
const PrayerTimes = lazy(() => import("./pages/PrayerTimes"));
const Dzikir = lazy(() => import("./pages/Dzikir"));
const Doa = lazy(() => import("./pages/Doa"));
const AsmaulHusna = lazy(() => import("./pages/AsmaulHusna"));
const BookmarkPage = lazy(() => import("./pages/BookmarkPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const QiblaPage = lazy(() => import("./pages/QiblaPage"));
const PuasaSunnahPage = lazy(() => import("./pages/PuasaSunnahPage"));
const LiveMakkahPage = lazy(() => import("./pages/LiveMakkahPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const KalenderPage = lazy(() => import("./pages/KalenderPage"));
const Tasbih = lazy(() => import("./pages/Tasbih"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PWAInitializer() {
  useServiceWorker();
  return null;
}

function RouteAudioStopper() {
  const location = useLocation();
  const surahAudio = useAudio();
  const ayatAudio = useAyatAudio();
  const stopSurahRef = useRef(surahAudio.stop);
  const stopAyatRef = useRef(ayatAudio.stop);

  useEffect(() => {
    stopSurahRef.current = surahAudio.stop;
  }, [surahAudio.stop]);
  useEffect(() => {
    stopAyatRef.current = ayatAudio.stop;
  }, [ayatAudio.stop]);

  useEffect(() => {
    stopSurahRef.current();
    stopAyatRef.current();
  }, [location.pathname]);

  return null;
}

function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  return (
    <>
      <PWAInitializer />
      <AppDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      <RouteAudioStopper />
      <Suspense
        fallback={
          <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 max-w-5xl">
              <SurahListSkeleton count={6} />
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Index onMenuClick={openDrawer} />} />
          <Route path="/surat/:id" element={<SuratDetail onMenuClick={openDrawer} />} />
          <Route path="/baca/:id" element={<QuranReader />} />
          <Route path="/jadwal-sholat" element={<PrayerTimes onMenuClick={openDrawer} />} />
          <Route path="/dzikir" element={<Dzikir onMenuClick={openDrawer} />} />
          <Route path="/tasbih" element={<Tasbih onMenuClick={openDrawer} />} />
          <Route path="/doa" element={<Doa onMenuClick={openDrawer} />} />
          <Route path="/asmaul-husna" element={<AsmaulHusna onMenuClick={openDrawer} />} />
          <Route path="/bookmark" element={<BookmarkPage onMenuClick={openDrawer} />} />
          <Route path="/catatan" element={<NotesPage onMenuClick={openDrawer} />} />
          <Route path="/arah-kiblat" element={<QiblaPage onMenuClick={openDrawer} />} />
          <Route path="/puasa-sunnah" element={<PuasaSunnahPage onMenuClick={openDrawer} />} />
          <Route path="/kalender" element={<KalenderPage onMenuClick={openDrawer} />} />
          <Route path="/live-makkah" element={<LiveMakkahPage onMenuClick={openDrawer} />} />
          <Route path="/tentang" element={<AboutPage onMenuClick={openDrawer} />} />
          <Route path="/settings" element={<Settings onMenuClick={openDrawer} />} />
          <Route path="*" element={<NotFound onMenuClick={openDrawer} />} />
        </Routes>
      </Suspense>

      <AudioPlayer />
      <PWAStatusBar />
      <ScrollToTopButton />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppSettingsProvider>
      <ReadingStatsProvider>
        <LastReadProvider>
          <BookmarkProvider>
            <NotesProvider>
              <DzikirProvider>
                <TasbihProvider>
                  <AudioProvider>
                    <AyatAudioProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                          <AppShell />
                        </BrowserRouter>
                      </TooltipProvider>
                    </AyatAudioProvider>
                  </AudioProvider>
                </TasbihProvider>
              </DzikirProvider>
            </NotesProvider>
          </BookmarkProvider>
        </LastReadProvider>
      </ReadingStatsProvider>
    </AppSettingsProvider>
  </QueryClientProvider>
);

export default App;