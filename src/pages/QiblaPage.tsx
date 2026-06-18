import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { QiblaCompass } from "@/components/QiblaCompass";
import { Card, CardContent } from "@/components/ui/card";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Compass, MapPin, AlertCircle } from "lucide-react";

export default function QiblaPage() {
  useDocumentTitle("Arah Kiblat");

  const { location, locationError, isFetchingLocation, requestLocation } =
    usePrayerTimes();

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl"
        aria-labelledby="qibla-title"
      >
        <section className="mb-6">
          <h1
            id="qibla-title"
            className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2"
          >
            <Compass className="w-7 h-7 text-emerald-600" aria-hidden="true" />
            Arah Kiblat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kompas digital menuju Ka'bah di Masjidil Haram
          </p>
        </section>

        {/* Location status */}
        {locationError && (
          <Card className="border-amber-500/40 mb-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Lokasi belum tersedia
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locationError}. Kiblat akan ditampilkan ke arah utara (default).
                  </p>
                </div>
                <button
                  onClick={() => requestLocation(true)}
                  disabled={isFetchingLocation}
                  className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold disabled:opacity-60"
                >
                  {isFetchingLocation ? "..." : "Coba Lagi"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compass */}
        <Card className="border-border/60">
          <CardContent className="p-6 sm:p-10">
            <QiblaCompass location={location} />
          </CardContent>
        </Card>

        {/* Location info */}
        {location && (
          <Card className="border-border/60 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {location.city || "Lokasi tidak diketahui"}
                    {location.country && `, ${location.country}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}° •{" "}
                    {location.method === "gps"
                      ? "GPS"
                      : location.method === "ip"
                        ? "IP"
                        : location.method === "manual"
                          ? "Manual"
                          : "Default"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border/40 text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground mb-1.5">💡 Tips</p>
          <ul className="space-y-1.5 list-disc pl-4">
            <li>Kalibrasi kompas dengan menggerakkan perangkat dalam bentuk angka 8.</li>
            <li>Hindari berada dekat benda logam atau magnet saat menggunakan kompas.</li>
            <li>Untuk hasil akurat, gunakan di luar ruangan dengan sinyal GPS yang kuat.</li>
          </ul>
        </div>
      </main>

      <AudioPlayer />
    </div>
  );
}