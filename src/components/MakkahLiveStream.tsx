import { useState, useEffect, useRef } from "react";
import { WifiOff, ExternalLink, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Live stream config — Masjidil Haram via Saudi Quran TV.
 *
 * Menggunakan channel custom path `/SaudiQuranTv/live` (user-provided).
 * YouTube support embed dari channel custom URL (`/embed/live_stream?channel=...`)
 * dengan format `/channel-slug/live`.
 *
 * Jika embed live_stream gagal (channel off-air atau embed disabled),
 * ada fallback ke video spesifik `fZvuHkHYaXk` yang diembed langsung.
 */
const LIVE_STREAMS = [
  {
    id: "saudi-quran-tv-live",
    name: "Saudi Quran TV",
    nameArabic: "المسجد الحرام",
    description:
      "Siaran langsung 24 jam dari Masjidil Haram dengan fokus utama Ka'bah dan area thawaf. Channel resmi Saudi Broadcasting Authority.",
    /**
     * Embed dari channel custom URL (saudiqurantv).
     * Format: /embed/live_stream?channel=CUSTOM_SLUG
     * YouTube resolve otomatis slug → channel ID di server.
     */
    embedUrl:
      "https://www.youtube.com/embed/live_stream?channel=SaudiQuranTv&autoplay=1&mute=1",
    directUrl: "https://www.youtube.com/SaudiQuranTv/live",
  },
  {
    id: "saudi-quran-tv-direct",
    name: "Saudi Quran TV (Live Stream)",
    nameArabic: "بث مباشر",
    description:
      "Live stream spesifik dari Saudi Quran TV — embedded langsung dari video ID untuk memastikan ketersediaan streaming.",
    /**
     * Embed langsung dari video ID `fZvuHkHYaXk`.
     * Ini adalah live stream Ka'bah aktif yang diembed langsung,
     * bypass /live_stream?channel= endpoint yang kadang bermasalah.
     */
    embedUrl: "https://www.youtube.com/embed/fZvuHkHYaXk?autoplay=1&mute=1",
    directUrl: "https://www.youtube.com/watch?v=fZvuHkHYaXk",
  },
];

export function LiveStreamEmbed({ className }: { className?: string }) {
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState(false);
  const loadTimerRef = useRef<number | null>(null);

  const currentStream = LIVE_STREAMS[currentStreamIndex];

  // Reset state saat ganti stream
  useEffect(() => {
    setLoading(true);
    setIframeLoaded(false);
    setError(false);
  }, [currentStreamIndex]);

  /**
   * Timeout fallback: kalau iframe load event tidak fire dalam 10 detik,
   * anggap stream gagal.
   *
   * Action: advance ke stream berikutnya, atau tampilkan error kalau
   * semua sudah dicoba.
   */
  useEffect(() => {
    if (!loading || iframeLoaded) return;

    loadTimerRef.current = window.setTimeout(() => {
      if (currentStreamIndex < LIVE_STREAMS.length - 1) {
        setCurrentStreamIndex((prev) => prev + 1);
      } else {
        setLoading(false);
        setError(true);
      }
    }, 10000);

    return () => {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
        loadTimerRef.current = null;
      }
    };
  }, [loading, iframeLoaded, currentStreamIndex]);

  const handleRetry = () => {
    setCurrentStreamIndex(0);
    setLoading(true);
    setIframeLoaded(false);
    setError(false);
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setIframeLoaded(false);
    if (currentStreamIndex < LIVE_STREAMS.length - 1) {
      setCurrentStreamIndex((prev) => prev + 1);
    } else {
      setError(true);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60",
        className,
      )}
    >
      <CardContent className="p-0">
        {/* Video container — 16:9 aspect ratio */}
        <div className="relative aspect-video bg-muted">
          {error ? (
            <ErrorState
              onRetry={handleRetry}
              directUrl={currentStream.directUrl}
            />
          ) : (
            <>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <div className="text-center">
                    <Loader2
                      className="w-7 h-7 mx-auto animate-spin text-primary mb-2"
                      aria-hidden="true"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Memuat streaming...
                    </p>
                    {currentStreamIndex > 0 && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        Mencoba alternatif ({currentStreamIndex + 1}/{LIVE_STREAMS.length})
                      </p>
                    )}
                  </div>
                </div>
              )}
              <iframe
                key={currentStream.id}
                src={currentStream.embedUrl}
                title={currentStream.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </>
          )}
        </div>

        {/* Stream info — selalu tampilkan walaupun error */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  {error ? (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground" />
                  ) : (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider",
                    error
                      ? "text-muted-foreground"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {error ? "OFFLINE" : "LIVE 24 JAM"}
                </span>
                {!error && currentStreamIndex > 0 && (
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                    via direct embed
                  </span>
                )}
              </div>
              <h3 className="font-bold text-foreground text-sm">
                {error ? "Streaming Tidak Tersedia" : currentStream.name}
              </h3>
              <p
                className="font-arabic text-xs text-muted-foreground"
                dir="rtl"
                lang="ar"
              >
                {currentStream.nameArabic}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full shrink-0 h-8 w-8"
              aria-label="Buka di YouTube"
            >
              <a
                href={currentStream.directUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error
              ? "Semua channel live yang tersedia sedang offline atau embed di-disable. Silakan buka di YouTube untuk menonton langsung."
              : currentStream.description}
          </p>

          {/* Retry hint — kalau pakai alternatif */}
          {!error && LIVE_STREAMS.length > 1 && currentStreamIndex > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
              <p className="text-[10px] text-muted-foreground">
                Stream utama tidak tersedia, menggunakan alternatif
              </p>
              <button
                onClick={handleRetry}
                className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" aria-hidden="true" />
                Coba lagi
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface ErrorStateProps {
  onRetry: () => void;
  directUrl: string;
}

/**
 * Error state ketika semua channel gagal dimuat.
 */
function ErrorState({ onRetry, directUrl }: ErrorStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-5">
      <WifiOff
        className="w-9 h-9 text-muted-foreground mb-2.5"
        aria-hidden="true"
      />
      <p className="font-semibold text-foreground text-sm mb-1">
        Streaming tidak dapat dimuat
      </p>
      <p className="text-[11px] text-muted-foreground mb-3 max-w-xs leading-relaxed">
        Kemungkinan channel sedang off-air atau embed dinonaktifkan oleh pemilik channel.
      </p>

      <div className="rounded-xl bg-muted/40 border border-border/60 p-2.5 mb-3 max-w-xs text-left">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
          <AlertCircle className="w-2.5 h-2.5" aria-hidden="true" />
          Kemungkinan Penyebab
        </p>
        <ul className="text-[10px] text-foreground/80 leading-relaxed space-y-0.5 list-disc pl-4">
          <li>Channel tidak sedang live streaming</li>
          <li>Pemilik channel menonaktifkan embed</li>
          <li>Koneksi internet tidak stabil</li>
        </ul>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <Button onClick={onRetry} variant="outline" size="sm" className="rounded-full h-8">
          <RefreshCw className="w-3 h-3 mr-1.5" aria-hidden="true" />
          Coba Lagi
        </Button>
        <Button asChild size="sm" className="rounded-full h-8">
          <a href={directUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3 mr-1.5" aria-hidden="true" />
            Buka YouTube
          </a>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Backward-compatible exports
// ============================================================================

/**
 * @deprecated Gunakan `<LiveStreamEmbed />` langsung.
 */
export const MakkahLiveStream = LiveStreamEmbed;