import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, Sparkles, Moon, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { HijriCalendar } from "@/components/HijriCalendar";
import { HolidayList } from "@/components/HolidayList";
import { getMonthCalendar, getUpcomingEvents, getTodayInfo, formatFullDate } from "@/lib/hijri-calendar";
import { useDocumentTitle } from "@/hooks/use-document-title";

interface KalenderProps {
  onMenuClick: () => void;
}

export default function Kalender({ onMenuClick }: KalenderProps) {
  useDocumentTitle("Kalender Hijriah");
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [activeTab, setActiveTab] = useState<"kalender" | "libur">("kalender");

  const days = useMemo(() => getMonthCalendar(viewDate.year, viewDate.month, { today }), [viewDate.year, viewDate.month, today]);
  const upcomingEvents = useMemo(() => getUpcomingEvents({ daysAhead: 90 }), []);
  const todayInfo = useMemo(() => getTodayInfo(today), [today]);

  const puasaInMonth = useMemo(() => days.reduce((sum, d) => sum + d.puasaSunnah.length, 0), [days]);

  const handlePrev = () => setViewDate((p) => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
  const handleNext = () => setViewDate((p) => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });
  const handleToday = () => setViewDate({ year: today.getFullYear(), month: today.getMonth() });

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="kalender-title">
        <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full h-8" size="sm">
          <Link to="/"><ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" /><span className="text-xs">Kembali</span></Link>
        </Button>
        <section className="mb-4">
          <h1 id="kalender-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" aria-hidden="true" />Kalender Hijriah
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Penanggalan Masehi & Hijriah beserta hari besar Islam</p>
        </section>

        <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white mb-4 shadow-lg shadow-emerald-500/20">
          <CardContent className="p-4 sm:p-5 relative">
            <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-pattern)" />
              </svg>
            </div>
            <div className="relative">
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-emerald-50/80">Hari Ini</p>
              <h2 className="text-lg sm:text-xl font-bold mb-0.5">{formatFullDate(today)}</h2>
              <p className="text-xs text-emerald-50/90 mb-2.5">{todayInfo.hijri.day} {todayInfo.hijri.monthName} {todayInfo.hijri.year} H</p>
              {todayInfo.holidays.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm" role="status" aria-live="polite">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <p className="text-xs font-semibold">{todayInfo.holidays[0].name} 🎉</p>
                </div>
              )}
              {(() => {
                const todayCells = days.filter(d => d.isToday);
                if (todayCells.length > 0 && todayCells[0].puasaSunnah.length > 0) {
                  return (
                    <div className="mt-1.5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm">
                      <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                      <p className="text-xs font-semibold">
                        {todayCells[0].puasaSunnah.map(p => p.title).join(", ")}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "kalender" | "libur")} className="space-y-4">
          <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 h-10 rounded-full bg-muted p-0.5" aria-label="Pilihan tampilan kalender">
            <TabsTrigger value="kalender" className="rounded-full gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />Kalender
            </TabsTrigger>
            <TabsTrigger value="libur" className="rounded-full gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />Hari Libur
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kalender" className="space-y-3 animate-fade-in">
            <Card className="border-border/60">
              <CardContent className="p-3 sm:p-4">
                <HijriCalendar year={viewDate.year} month={viewDate.month} days={days} onPrev={handlePrev} onNext={handleNext} />
                <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-center">
                  <Button variant="outline" size="sm" onClick={handleToday} className="rounded-full h-7 text-xs" aria-label="Kembali ke bulan ini">Hari Ini</Button>
                </div>
              </CardContent>
            </Card>

            {puasaInMonth > 0 && (
              <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-transparent">
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0" aria-hidden="true">
                      <Moon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-semibold text-foreground">Puasa Sunnah Bulan Ini</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-400">
                          {puasaInMonth}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Terdapat {puasaInMonth} kesempatan berpuasa sunnah bulan ini.
                      </p>
                      <Link to="/puasa-sunnah" className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline">
                        <Star className="w-3 h-3" />Lihat detail puasa sunnah
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/60">
              <CardContent className="p-3.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Keterangan</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 text-[11px]">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-emerald-700 ring-2 ring-primary/40 shrink-0" aria-hidden="true" /><span>Hari ini</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-500/15 ring-1 ring-emerald-500/40 shrink-0" aria-hidden="true" /><span>Hari besar</span></div>
                  <div className="flex items-center gap-2"><div className="relative w-4 h-4 rounded border border-border/40 bg-card shrink-0" aria-hidden="true"><div className="absolute left-0 top-1 bottom-1 w-0.5 bg-violet-500 rounded-r-full" /></div><span>Puasa sunnah</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-50/70 dark:bg-emerald-950/25 shrink-0" aria-hidden="true" /><span>Jumat</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-muted/40 shrink-0" aria-hidden="true" /><span>Weekend</span></div>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Konversi kalender berdasarkan algoritma <strong>Umm al-Qura</strong>. Tanggal Hijriah dapat berbeda ±1 hari tergantung rukyat lokal.</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="libur" className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-sm font-bold text-foreground">90 Hari Ke Depan</h2>
              <span className="text-[11px] text-muted-foreground font-medium" aria-live="polite">{upcomingEvents.length} hari libur</span>
            </div>
            <HolidayList events={upcomingEvents} showGreeting />
          </TabsContent>
        </Tabs>
      </main>
      <AudioPlayer />
    </div>
  );
}