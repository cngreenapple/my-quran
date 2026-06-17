import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioProvider } from "@/contexts/audio-context";
import { BookmarkProvider } from "@/hooks/use-bookmarks";
import { LastReadProvider } from "@/hooks/use-last-read";
import { SurahListSkeleton } from "@/components/LoadingSkeleton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const Index = lazy(() => import("./pages/Index"));
const SuratDetail = lazy(() => import("./pages/SuratDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BookmarkProvider>
      <LastReadProvider>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
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
                  <Route path="/" element={<Index />} />
                  <Route path="/surat/:id" element={<SuratDetail />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AudioProvider>
      </LastReadProvider>
    </BookmarkProvider>
  </QueryClientProvider>
);

export default App;