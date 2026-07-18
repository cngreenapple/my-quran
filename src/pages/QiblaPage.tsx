import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { QiblaCompass } from "@/components/QiblaCompass";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";

interface QiblaPageProps {
  onMenuClick: () => void;
}

export default function QiblaPage({ onMenuClick }: QiblaPageProps) {
  useDocumentTitle("Arah Kiblat");
  const { location, locationError, isFetchingLocation, requestLocation } = usePrayerTimes();
  const [gpsTriggered, setGpsTriggered] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="qibla-title">
        <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full h-8" size="sm">
          <Link to="/"><ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" /><span className="text-xs">Kembali</span></Link>
        </Button>
        <section className="mb-4">
          <h1 id="qibla-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" aria-hidden="true" />Arah Kiblat
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Kompas digital menuju Ka'bah di Masjidil Haram</p>
        </section>

        {locationError && (
          <Card className="border-amber-500/40 mb-3">
            <CardContent className="p-3.5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">Lokasi belum tersedia</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{locationError}</p>
                </div>
                <button onClick={() => requestLocation(true)} disabled={isFetchingLocation} className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-semibold disabled:opacity-60 shrink-0 inline-flex items-center gap-1">
                  <RefreshCw className={cn("w-3 h-3", isFetchingLocation && "animate-spin")} />
                  {isFetchingLocation ? "..." : "Coba"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/60">
          <CardContent className="p-4 sm:p-6"><QiblaCompass location={location} /></CardContent>
        </Card>

        {location && (
          <Card className="border-border/60 mt-3">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0" aria-hidden="true">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {location.city || "Lokasi tidak diketahui"}
                    {location.country && `, ${location.country}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}° •{" "}
                    {location.method === "gps" ? "GPS" : location.method === "ip" ? "IP" : location.method === "manual" ? "Manual" : "Default"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!gpsTriggered && !locationError && (
          <Card className="border-emerald-500/40 mt-3">
            <CardContent className="p-3.5">
              <div className="flex items-start gap-3">
                <Compass className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">GPS untuk akurasi maksimal</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Aktifkan GPS untuk arah kiblat yang lebih akurat</p>
                </div>
                <button
                  onClick={() => { requestLocation(true); setGpsTriggered(true); }}
                  disabled={isFetchingLocation}
                  className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-semibold disabled:opacity-60 shrink-0 inline-flex items-center gap-1"
                >
                  <RefreshCw className={cn("w-3 h-3", isFetchingLocation && "animate-spin")} />
                  {isFetchingLocation ? "..." : "GPS"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-3 p-3.5 rounded-2xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground mb-1.5">💡 Tips</p>
          <ul className="space-y-1 list-disc pl-4">
            <li>Kalibrasi kompas dengan menggerakkan perangkat dalam bentuk angka 8.</li>
            <li>Hindari berada dekat benda logam atau magnet saat menggunakan kompas.</li>
            <li>Untuk hasil akurat, gunakan di luar ruangan dengan sinyal GPS kuat.</li>
          </ul>
        </div>
      </main>
      <AudioPlayer />
    </div>
  );
}