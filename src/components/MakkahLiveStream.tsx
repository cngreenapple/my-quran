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
}

const LIVE_STREAMS: LiveStream[] = [
  { id: "makkah-main", name: "Masjidil Haram, Makkah", nameArabic: "المسجد الحرام", description: "Live streaming langsung dari Masjidil Haram dengan fokus Ka'bah. Siaran 24 jam.", embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC1Rb6nM0UYv8Ej3DI3T2u7A&autoplay=1&mute=1", directUrl: "https://www.youtube.com/@makkahlive" },
  { id: "madinah", name: "Masjid Nabawi, Madinah", nameArabic: "المسجد النبوي", description: "Live streaming dari Masjid Nabawi dengan makam Rasulullah ﷺ. Siaran 24 jam.", embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCMGqxqW-_0nFlGJVXWWF2Sw&autoplay=1&mute=1", directUrl: "https://www.youtube.com/@madinahlive" },
  { id: "kaaba-focus", name: "Ka'bah Focus", nameArabic: "الكعبة المشرفة", description: "Close-up view Ka'bah dari berbagai sudut. Cocok untuk tafakkur.", embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCd9I3w9cZjE2jvkRRy4GGHQ&autoplay=1&mute=1", directUrl: "https://www.youtube.com/@Kaabalive" },
];

function MakkahLiveStream({ stream, active }: { stream: LiveStream; active: boolean }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { setLoading(true); setError(false); }, [stream.id]);

  useEffect(() => {
    if (!active || !loading) return;
    const timer = setTimeout(() => { setLoading(false); setError(true); }, 10000);
    return () => clearTimeout(timer);
  }, [active, loading, stream.id]);

  if (!active) return null;

  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-5">
              <WifiOff className="w-9 h-9 text-muted-foreground mb-2.5" aria-hidden="true" />
              <p className="font-semibold text-foreground text-sm mb-1">Streaming tidak dapat dimuat</p>
              <p className="text-[11px] text-muted-foreground mb-3">Buka di YouTube langsung untuk melihat live streaming</p>
              <Button asChild size="sm" className="rounded-full h-8"><a href={stream.directUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 mr-1" />Buka YouTube</a></Button>
            </div>
          ) : (
            <>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <Loader2 className="w-7 h-7 mx-auto animate-spin text-primary mb-2" aria-hidden="true" />
                    <p className="text-[11px] text-muted-foreground">Memuat streaming...</p>
                  </div>
                </div>
              )}
              <iframe src={stream.embedUrl} title={stream.name} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen onLoad={() => setLoading(false)} onError={() => setError(true)} />
            </>
          )}
        </div>
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" /></span>
                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">LIVE</span>
              </div>
              <h3 className="font-bold text-foreground text-sm">{stream.name}</h3>
              <p className="font-arabic text-xs text-muted-foreground" dir="rtl">{stream.nameArabic}</p>
            </div>
            <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0 h-8 w-8" aria-label="Buka di YouTube">
              <a href={stream.directUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{stream.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LiveStreamSelector({ className }: { className?: string }) {
  const [activeId, setActiveId] = useState(LIVE_STREAMS[0].id);
  const active = LIVE_STREAMS.find((s) => s.id === activeId) || LIVE_STREAMS[0];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-2 sm:grid-cols-3" role="tablist">
        {LIVE_STREAMS.map((stream) => (
          <button key={stream.id} onClick={() => setActiveId(stream.id)} role="tab" aria-selected={activeId === stream.id} className={cn("px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border-2 text-center", activeId === stream.id ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border/60 bg-card text-muted-foreground hover:text-foreground")}>
            <Tv className="w-3.5 h-3.5 mx-auto mb-0.5" aria-hidden="true" />{stream.name.split(",")[0]}
          </button>
        ))}
      </div>
      <MakkahLiveStream stream={active} active={true} />
      {LIVE_STREAMS.filter((s) => s.id !== activeId).map((stream) => (
        <button key={stream.id} onClick={() => setActiveId(stream.id)} className="w-full text-left">
          <Card className="border-border/60 hover:border-primary/40 transition-all">
            <CardContent className="p-2.5 flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center"><Video className="w-4 h-4 text-white" aria-hidden="true" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-foreground truncate">{stream.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">Klik untuk menonton</p>
              </div>
              <Wifi className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}