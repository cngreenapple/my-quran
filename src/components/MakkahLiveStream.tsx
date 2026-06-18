import { useState, useEffect } from "react";
import { Video, Tv, ExternalLink, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LiveStream {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  embedUrl: string;
  directUrl: string;
  thumbnail?: string;
}

const LIVE_STREAMS: LiveStream[] = [
  {
    id: "makkah-main",
    name: "Masjidil Haram, Makkah",
    nameArabic: "المسجد الحرام",
    description:
      "Live streaming langsung dari Masjidil Haram dengan fokus Ka'bah. Siaran 24 jam.",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC1Rb6nM0UYv8Ej3DI3T2u7A&autoplay=1&mute=1",
    directUrl: "https://www.youtube.com/@makkahlive",
  },
  {
    id: "madinah",
    name: "Masjid Nabawi, Madinah",
    nameArabic: "المسجد النبوي",
    description:
      "Live streaming dari Masjid Nabawi dengan makam Rasulullah ﷺ. Siaran 24 jam.",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCMGqxqW-_0nFlGJVXWWF2Sw&autoplay=1&mute=1",
    directUrl: "https://www.youtube.com/@madinahlive",
  },
  {
    id: "kaaba-focus",
    name: "Ka'bah Focus",
    nameArabic: "الكعبة المشرفة",
    description:
      "Close-up view Ka'bah dari berbagai sudut. Cocok untuk tafakkur.",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCd9I3w9cZjE2jvkRRy4GGHQ&autoplay=1&mute=1",
    directUrl: "https://www.youtube.com/@Kaabalive",
  },
];

interface MakkahLiveStreamProps {
  stream: LiveStream;
  active: boolean;
}

function MakkahLiveStream({ stream, active }: MakkahLiveStreamProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reset state when stream changes
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [stream.id]);

  // Timeout fallback: kalau iframe tidak load dalam 10s, anggap gagal
  useEffect(() => {
    if (!active || !loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [active, loading, stream.id]);

  if (!active) return null;

  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-0">
        {/* Video player */}
        <div className="relative aspect-video bg-muted">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <WifiOff className="w-10 h-10 text-muted-foreground mb-3" aria-hidden="true" />
              <p className="font-semibold text-foreground mb-1">
                Streaming tidak dapat dimuat
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Buka di YouTube langsung untuk melihat live streaming
              </p>
              <Button asChild size="sm" className="rounded-full">
                <a
                  href={stream.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Buka di YouTube
                </a>
              </Button>
            </div>
          ) : (
            <>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-2" aria-hidden="true" />
                    <p className="text-xs text-muted-foreground">Memuat streaming...</p>
                  </div>
                </div>
              )}
              <iframe
                src={stream.embedUrl}
                title={stream.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setLoading(false)}
                onError={() => setError(true)}
              />
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  LIVE
                </span>
              </div>
              <h3 className="font-bold text-foreground">{stream.name}</h3>
              <p
                className="font-arabic text-sm text-muted-foreground"
                dir="rtl"
              >
                {stream.nameArabic}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full shrink-0"
              aria-label="Buka di YouTube"
            >
              <a
                href={stream.directUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {stream.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface LiveStreamSelectorProps {
  className?: string;
}

export function LiveStreamSelector({ className }: LiveStreamSelectorProps) {
  const [activeId, setActiveId] = useState(LIVE_STREAMS[0].id);
  const active = LIVE_STREAMS.find((s) => s.id === activeId) || LIVE_STREAMS[0];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tab selector */}
      <div className="grid gap-2 sm:grid-cols-3" role="tablist">
        {LIVE_STREAMS.map((stream) => (
          <button
            key={stream.id}
            onClick={() => setActiveId(stream.id)}
            role="tab"
            aria-selected={activeId === stream.id}
            className={cn(
              "px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all border-2 text-center",
              activeId === stream.id
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <Tv className="w-4 h-4 mx-auto mb-1" aria-hidden="true" />
            {stream.name.split(",")[0]}
          </button>
        ))}
      </div>

      {/* Active stream */}
      <MakkahLiveStream stream={active} active={true} />

      {/* Other streams */}
      {LIVE_STREAMS.filter((s) => s.id !== activeId).map((stream) => (
        <button
          key={stream.id}
          onClick={() => setActiveId(stream.id)}
          className="w-full text-left"
        >
          <Card className="border-border/60 hover:border-primary/40 transition-all">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {stream.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Klik untuk menonton
                </p>
              </div>
              <Wifi className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}