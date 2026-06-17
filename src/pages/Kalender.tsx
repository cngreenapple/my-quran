import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { HijriCalendar } from "@/components/HijriCalendar";
import { HolidayList } from "@/components/HolidayList";
import {
  getMonthCalendar,
  getUpcomingEvents,
  getTodayInfo,
  formatFullDate,
} from "@/lib/hijri-calendar";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";

export default function Kalender() {
  useDocumentTitle("Kalender Hijriah");

  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [activeTab, setActiveTab] = useState<"kalender" | "libur">("kalender");

  const days = useMemo(
    () => getMonthCalendar(viewDate.year, viewDate.month, { today }),
    [viewDate.year, viewDate.month, today],
  );

  const upcomingEvents = useMemo(() => getUpcomingEvents({ daysAhead: 90 }), []);
  const todayInfo = useMemo(() => getTodayInfo(today), [today]);

  const handlePrev = () => {
    setViewDate((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNext = () => {
    setViewDate((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleToday = () => {
    setViewDate({ year: today.getFullYear(), month: today.getMonth() });
  };

  return (
    <div className="min-h-dvh bg-background bg-mesh dark:bg-mesh-dark">
      <Header />

      <main
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl"
        aria-labelledby="kalender-title"
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
          <h1 id="kalender-title" className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-primary" aria-hidden="true" />
            Kalender Hijriah
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penanggalan Masehi & Hijriah beserta hari besar Islam
          </p>
        </section>

        {/* Today Widget */}
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white mb-5 shadow-xl shadow-emerald-500/20">
          <CardContent className="p-5 sm:p-6 relative">
            <div className="absolute inset-0 opacity-10" aria-hidden="true">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="hero-pattern"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-pattern)" />
              </svg>
            </div>
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-emerald-50/80">
                Hari Ini
              </p>
              <h2 className="text-xl sm:text-2xl font-bold mb-0.5">
                {formatFullDate(today)}
              </h2>
              <p className="text-sm text-emerald-50/90 mb-3">
                {todayInfo.hijri.day} {todayInfo.hijri.monthName}{" "}
                {todayInfo.hijri.year} H
              </p>
              {todayInfo.holidays.length > 0 && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 backdrop-blur-sm"
                  role="status"
                  aria-live="polite"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <p className="text-sm font-semibold">
                    {todayInfo.holidays[0].name} 🎉
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Kalender / Libur */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "kalender" | "libur")}
          className="space-y-4"
        >
          <TabsList
            className="grid w-full max-w-sm mx-auto grid-cols-2 h-11 rounded-full bg-muted p-1"
            aria-label="Pilihan tampilan kalender"
          >
            <TabsTrigger
              value="kalender"
              className="rounded-full gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
              Kalender
            </TabsTrigger>
            <TabsTrigger
              value="libur"
              className="rounded-full gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Hari Libur
            </TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="kalender" className="space-y-4 animate-fade-in">
            <Card className="border-border/60">
              <CardContent className="p-3 sm:p-5">
                <HijriCalendar
                  year={viewDate.year}
                  month={viewDate.month}
                  days={days}
                  onPrev={handlePrev}
                  onNext={handleNext}
                />
                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    className="rounded-full"
                    aria-label="Kembali ke bulan ini"
                  >
                    Hari Ini
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="border-border/60">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Keterangan
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-primary" aria-hidden="true" />
                    <span>Hari ini</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200"
                      aria-hidden="true"
                    />
                    <span>Jumat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-muted" aria-hidden="true" />
                    <span>Weekend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-md bg-emerald-500/15 ring-1 ring-emerald-500/30"
                      aria-hidden="true"
                    />
                    <span>Hari besar</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground leading-relaxed">
                  <p className="flex items-start gap-1.5">
                    <Moon className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      Konversi kalender berdasarkan algoritma <strong>Umm al-Qura</strong>.
                      Tanggal Hijriah dapat berbeda ±1 hari tergantung rukyat lokal.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Holiday Tab */}
          <TabsContent value="libur" className="space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-base font-bold text-foreground">
                  90 Hari Ke Depan
                </h2>
                <span
                  className="text-xs text-muted-foreground font-medium"
                  aria-live="polite"
                >
                  {upcomingEvents.length} hari libur
                </span>
              </div>
              <HolidayList events={upcomingEvents} showGreeting />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AudioPlayer />
    </div>
  );
}