import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  RefreshCw,
  Clock,
  Compass,
  Calendar,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PrayerCard } from "@/components/PrayerCard";
import { QiblaCompass } from "@/components/QiblaCompass";
import { ErrorState } from "@/components/ErrorState";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { useLastRead } from "@/hooks/use-last-read";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { formatCountdown, formatHijriId, PRAYER_METHODS } from "@/lib/prayer-times";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

export default function PrayerTimes() {
  useDocumentTitle("Jadwal Sholat & Kiblat");

  const {
    schedule,
    prayerList,
    nextPrayer,
    countdownMs,
    location,
    locationError,
    isFetchingLocation,
    method,
    setMethod,
    requestLocation,
    isLoading,
    isError,
    refetch,
  } = usePrayerTimes();

  const { clearLastRead } = useLastRead(); // dummy, just to keep hook
  void clearLastRead;

  const handleRefreshLocation = async () => {
    try {
      await requestLocation(true);
      showSuccess("Lokasi diperbarui");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Gagal mendapatkan lokasi");
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl"
        aria-labelledby="prayer-title"
      >
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

        <section className="mb-6">
          <h1 id="prayer-title" className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary" aria-hidden="true" />
            Jadwal Sholat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Waktu sholat dan arah kiblat untuk lokasi Anda
          </p>
        </section>

        {/* Location Card */}
        <section className="mb-5" aria-label="Lokasi saat ini">
          <Card className="border-border/60 overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20"
                  aria-hidden="true"
                >
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {isFetchingLocation ? "Mencari lokasi..." : location?.city || "Lokasi tidak diketahui"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {location
                      ? `${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}° • ${location.method === "gps" ? "GPS" : location.method === "ip" ? "IP" : location.method === "manual" ? "Manual" : "Default"}`
                      : "Aktifkan GPS untuk akurasi"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshLocation}
                  disabled={isFetchingLocation}
                  className="rounded-full shrink-0"
                  aria-label="Refresh lokasi"
                >
                  {isFetchingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {locationError && (
                <div
                  className="mt-3 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl"
                  role="alert"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{locationError}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Tabs: Jadwal / Kiblat */}
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList
            className="grid w-full max-w-sm mx-auto grid-cols-2 h-11 rounded-full bg-muted p-1"
            aria-label="Pilihan tampilan"
          >
            <TabsTrigger
              value="schedule"
              className="rounded-full gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Jadwal
            </TabsTrigger>
            <TabsTrigger
              value="qibla"
              className="rounded-full gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              Kiblat
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 animate-fade-in">
            {isLoading ? (
              <div className="space-y-3" aria-busy="true" aria-label="Memuat jadwal">
                <div className="h-32 rounded-3xl bg-muted/50 animate-pulse" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <ErrorState
                title="Gagal Memuat Jadwal"
                message="Tidak dapat menghubungi server. Periksa koneksi Anda dan coba lagi."
                onRetry={() => refetch()}
              />
            ) : !schedule ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" aria-hidden="true" />
                <p>Memuat jadwal...</p>
              </div>
            ) : (
              <>
                {/* Next Prayer Hero */}
                {nextPrayer && (
                  <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent overflow-hidden">
                    <CardContent className="p-5 sm:p-6 relative">
                      <div className="absolute top-3 right-3" aria-hidden="true">
                        <Sun className="w-5 h-5 text-emerald-500/40" />
                      </div>
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                        Sholat Berikutnya
                      </p>
                      <div className="flex items-end justify-between gap-3 mb-3">
                        <div>
                          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                            {nextPrayer.name}
                          </h2>
                          <p className="text-sm text-muted-foreground font-medium">
                            {nextPrayer.time} WIB
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums"
                            aria-live="polite"
                            aria-atomic="true"
                          >
                            {formatCountdown(countdownMs)}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                            Countdown
                          </p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div
                        className="h-1 bg-emerald-500/20 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={Math.round(
                          (countdownMs % (60 * 60 * 1000 * 6)) / (60 * 60 * 1000 * 6) * 100,
                        )}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000"
                          style={{
                            width: `${Math.max(5, Math.min(100, ((countdownMs % (60 * 60 * 1000 * 6)) / (60 * 60 * 1000 * 6)) * 100))}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hijri Date */}
                <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-muted/40 border border-border/40">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {formatHijriId(schedule.hijriDate)}
                  </p>
                </div>

                {/* Prayer List */}
                <ul className="space-y-2" role="list" aria-label="Daftar waktu sholat">
                  {prayerList.map((prayer) => (
                    <li key={prayer.name}>
                      <PrayerCard
                        prayer={prayer}
                        isNext={prayer.isNext}
                      />
                    </li>
                  ))}
                </ul>

                {/* Method Selector */}
                <Card className="border-border/60">
                  <CardContent className="p-4">
                    <label
                      htmlFor="prayer-method"
                      className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block"
                    >
                      Metode Kalkulasi
                    </label>
                    <select
                      id="prayer-method"
                      value={method}
                      onChange={(e) => setMethod(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {PRAYER_METHODS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.region})
                        </option>
                      ))}
                    </select>
                  </CardContent>
                </Card>

                {/* Sun times */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                    <Sun className="w-3.5 h-3.5 mx-auto mb-1 text-amber-600" aria-hidden="true" />
                    <p className="text-xs text-muted-foreground">Terbit</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {schedule.timings.Sunrise}
                    </p>
                  </div>
                  <div className="px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30">
                    <Moon className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-600" aria-hidden="true" />
                    <p className="text-xs text-muted-foreground">Terbenam</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {schedule.timings.Sunset}
                    </p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Qibla Tab */}
          <TabsContent value="qibla" className="animate-fade-in">
            <Card className="border-border/60">
              <CardContent className="p-6 sm:p-8">
                <QiblaCompass location={location} />
              </CardContent>
            </Card>
            <div className="mt-4 text-center text-xs text-muted-foreground px-4">
              <p>
                Kalibrasi kompas dengan menggerakkan perangkat dalam bentuk angka 8.
              </p>
              <p className="mt-1">
                Arah yang ditampilkan sudah disesuaikan dengan deklinasi magnetik.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AudioPlayer />
    </div>
  );
}