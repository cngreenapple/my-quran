import { useState, Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AudioProvider, useAudio } from "@/contexts/audio-context";
import { AyatAudioProvider, useAyatAudio } from "@/contexts/ayat-audio-context";
import { LastReadProvider } from "@/hooks/use-last-read";
import { DzikirProvider } from "@/hooks/use-dzikir-counter";
import { ReadingStatsProvider } from "@/hooks/use-reading-stats";
import { AppSettingsProvider } from "@/hooks/use-app-settings";
import { BookmarkProvider } from "@/hooks/use-bookmarks";
import { NotesProvider } from "@/hooks/use-notes";
import { AppDrawer } from "@/components/AppDrawer";
import { SurahListSkeleton } from "@/components/LoadingSkeleton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const Index = lazy(() => import("./pages/Index"));
const SuratDetail = lazy(() => import("./pages/SuratDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const PrayerTimes = lazy(() => import("./pages/PrayerTimes"));
const Dzikir = lazy(() => import("./pages/Dzikir"));
const Doa = lazy(() => import("./pages/Doa"));
const AsmaulHusna = lazy(() => import("./pages/AsmaulHusna"));
const Kalender = lazy(() => import("./pages/Kalender"));
const BookmarkPage = lazy(() => import("./pages/BookmarkPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const QiblaPage = lazy(() => import("./pages/QiblaPage"));
const PuasaSunnahPage = lazy(() => import("./pages/PuasaSunnahPage"));
const LiveMakkahPage = lazy(() => import("./pages/LiveMakkahPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

/**
 * Komponen yang listen route change dan stop semua audio.
 * Harus di dalam BrowserRouter agar bisa pakai useLocation.
 */
function RouteAudioStopper() {
  const location = useLocation();
  const surahAudio = useAudio();
  const ayatAudio = useAyatAudio();

  useEffect(() => {
    // Setiap kali route berubah, stop kedua audio
    surahAudio.stop();
    ayatAudio.stop();
  }, [location.pathname, surahAudio, ayatAudio]);

  return null;
}

function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
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
          <Route
            path="/"
            element={<Index onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/surat/:id"
            element={<SuratDetail onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/jadwal-sholat"
            element={<PrayerTimes onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/dzikir"
            element={<Dzikir onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/doa"
            element={<Doa onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/asmaul-husna"
            element={<AsmaulHusna onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/kalender"
            element={<Kalender onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/bookmark"
            element={<BookmarkPage onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/catatan"
            element={<NotesPage onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/arah-kiblat"
            element={<QiblaPage onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/puasa-sunnah"
            element={<PuasaSunnahPage onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/live-makkah"
            element={<LiveMakkahPage onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/tentang"
            element={<AboutPage onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="/settings"
            element={<Settings onMenuClick={() => setDrawerOpen(true)} />}
          />
          <Route
            path="*"
            element={<NotFound onMenuClick={() => setDrawerOpen(true)} />}
          />
        </Routes>
      </Suspense>
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
                <AudioProvider>
                  <AyatAudioProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter
                        future={{
                          v7_startTransition: true,
                          v7_relativeSplatPath: true,
                        }}
                      >
                        <AppShell />
                      </BrowserRouter>
                    </TooltipProvider>
                  </AyatAudioProvider>
                </AudioProvider>
              </DzikirProvider>
            </NotesProvider>
          </BookmarkProvider>
        </LastReadProvider>
      </ReadingStatsProvider>
    </AppSettingsProvider>
  </QueryClientProvider>
);

export default App;