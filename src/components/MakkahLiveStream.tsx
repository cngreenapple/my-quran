import { useState, useEffect } from "react";
import { Video, WifiOff, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Single live stream config — Masjidil Haram via Saudi Quran TV.
 *
 * Untuk embed dari @handle YouTube, gunakan URL handle-based.
 * Jika auto-resolve gagal, error state akan show tombol
 * "Buka YouTube" yang mengarah ke directUrl.
 */
const LIVE_STREAM = {
  id: "masjidil haram-makkah",
  name: "Masjidil Haram, Makkah",
  nameArabic: "المسجد الحرام",
  description:
    "Siaran langsung 24 jam dari Masjidil Haram, Makkah. Dilayani oleh channel Saudi Quran TV dengan fokus utama Ka'bah dan area thawaf.",
  /**
   * Embed URL dengan handle-based channel resolution.
   * YouTube embed API support format ini untuk live stream dari @handle.
   */
  embedUrl:
    "https://www.youtube.com/embed/live_stream?channel=@SaudiQuranTv&autoplay=1&mute=1",
  /** Direct URL ke YouTube live page — fallback kalau embed gagal. */
  directUrl: "https://www.youtube.com/@SaudiQuranTv/live",
} as const;

interface LiveStreamProps {
  className?: string;
}

/**
 * Komponen utama live streaming Masjidil Haram.
 *
 * Render langsung 1 stream full-width — tidak ada tab/selector
 * karena user sudah memilih channel spesifik (Saudi Quran TV).
 *
 * State lifecycle:
 * 1. Loading: spinner + "Memuat streaming..." (max 10 detik timeout)
 * 2. Error: icon WifiOff + "Buka YouTube" button
 * 3. Playing: iframe embed dengan autoplay+muted
 *
 * Pakai `key={stream.id}` di parent kalau perlu force re-mount
 * (mis. ganti channel di masa depan).
 */
export function LiveStreamEmbed({ className }: LiveStreamProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reset state saat komponen mount
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, []);

  // Fallback timeout — kalau iframe load event tidak fire dalam 10 detik,
  // asumsikan embed gagal dan tampilkan error state dengan link YouTube.
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [loading]);

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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-5">
              <WifiOff
                className="w-9 h-9 text-muted-foreground mb-2.5"
                aria-hidden="true"
              />
              <p className="font-semibold text-foreground text-sm mb-1">
                Streaming tidak dapat dimuat
              </p>
              <p className="text-[11px] text-muted-foreground mb-3 max-w-xs">
                Buka di YouTube langsung untuk melihat live streaming
                Masjidil Haram dari Saudi Quran TV.
              </p>
              <Button
                asChild
                size="sm"
                className="rounded-full h-8"
              >
                <a
                  href={LIVE_STREAM.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3 h-3 mr-1" aria-hidden="true" />
                  Buka YouTube
                </a>
              </Button>
            </div>
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
                  </div>
                </div>
              )}
              <iframe
                src={LIVE_STREAM.embedUrl}
                title={LIVE_STREAM.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
              />
            </>
          )}
        </div>

        {/* Stream info */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  LIVE 24 JAM
                </span>
              </div>
              <h3 className="font-bold text-foreground text-sm">
                {LIVE_STREAM.name}
              </h3>
              <p
                className="font-arabic text-xs text-muted-foreground"
                dir="rtl"
                lang="ar"
              >
                {LIVE_STREAM.nameArabic}
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
                href={LIVE_STREAM.directUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {LIVE_STREAM.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Backward-compatible exports
// ============================================================================
// Kode lama mungkin masih import `LiveStreamSelector` atau `MakkahLiveStream`.
// Kita export sebagai wrapper untuk cegah import errors.

/**
 * @deprecated Gunakan `<LiveStreamEmbed />` langsung.
 * Wrapper untuk backward-compatibility dengan import lama.
 */
export const MakkahLiveStream = LiveStreamEmbed;

/**
 * @deprecated Tidak ada lagi multi-stream selector. Single stream only.
 * Wrapper untuk backward-compatibility.
 */
export const LiveStreamSelector = ({ className }: { className?: string }) => {
  return (
    <div className={cn("space-y-3", className)}>
      <LiveStreamEmbed />
    </div>
  );
};

// Re-export untuk consumer yang butuh raw config
export { LIVE_STREAM };