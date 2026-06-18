import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getTodayInfo, GREGORIAN_MONTH_NAMES } from "@/lib/date";
import { getHolidayOnDate } from "@/data/islamic-holidays";
import { CalendarHeader } from "@/components/kalender/CalendarHeader";
import { CalendarMonthCard } from "@/components/kalender/CalendarMonthCard";
import { HijriahMonthGrid } from "@/components/kalender/HijriahMonthGrid";
import { GregorianMonthGrid } from "@/components/kalender/GregorianMonthGrid";
import { CalendarLegend } from "@/components/kalender/CalendarLegend";
import { HolidaysTable } from "@/components/kalender/HolidaysTable";
import { HIJRI_MONTH_NAMES_ID } from "@/components/kalender/constants";

interface KalenderPageProps {
  onMenuClick: () => void;
}

export default function KalenderPage({ onMenuClick }: KalenderPageProps) {
  useDocumentTitle("Kalender Islam");
  const today = useMemo(() => getTodayInfo(), []);
  const todayHoliday = useMemo(
    () => getHolidayOnDate(today.hijri.month, today.hijri.day),
    [today.hijri.month, today.hijri.day],
  );

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main
        className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl"
        aria-labelledby="kalender-title"
      >
        <Button
          variant="ghost"
          asChild
          className="mb-2.5 -ml-2 rounded-full h-8"
          size="sm"
        >
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="text-xs">Kembali</span>
          </Link>
        </Button>

        <section className="mb-4">
          <h1
            id="kalender-title"
            className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2"
          >
            <Calendar className="w-6 h-6 text-violet-600" aria-hidden="true" />
            Kalender Islam
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Konversi Masehi ↔ Hijriah & hari besar Islam
          </p>
        </section>

        <TodayCard today={today} todayHoliday={todayHoliday} />

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList
            className="grid w-full max-w-sm mx-auto grid-cols-2 h-10 rounded-full bg-muted p-0.5"
            aria-label="Pilihan tampilan kalender"
          >
            <TabsTrigger
              value="calendar"
              className="rounded-full gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              Kalender
            </TabsTrigger>
            <TabsTrigger
              value="holidays"
              className="rounded-full gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Hari Besar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="animate-fade-in">
            <CalendarView today={today} />
          </TabsContent>

          <TabsContent value="holidays" className="animate-fade-in">
            <HolidaysTable />
          </TabsContent>
        </Tabs>
      </main>
      <AudioPlayer />
    </div>
  );
}

// --- Sub-komponen lokal (page-specific) ---

interface TodayCardProps {
  today: ReturnType<typeof getTodayInfo>;
  todayHoliday: ReturnType<typeof getHolidayOnDate>;
}

function TodayCard({ today, todayHoliday }: TodayCardProps) {
  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-violet-500/4 to-transparent mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-0.5">
              {today.gregorian.weekday}
            </p>
            <p className="text-base font-bold text-foreground truncate">
              {today.gregorian.day} {GREGORIAN_MONTH_NAMES[today.gregorian.month - 1]}{" "}
              {today.gregorian.year}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {today.hijri.day} {today.hijri.monthName} {today.hijri.year} H
            </p>
          </div>
          <div className="text-right shrink-0">
            <p
              className="font-arabic text-2xl text-violet-600 dark:text-violet-400 leading-none"
              dir="rtl"
              lang="ar"
            >
              {today.hijri.monthArabic}
            </p>
            <p className="text-[9px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
              Hijriah
            </p>
          </div>
        </div>
        {todayHoliday && (
          <div className="mt-3 pt-3 border-t border-violet-500/20 flex items-center gap-2">
            <Sparkles
              className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0"
              aria-hidden="true"
            />
            <p className="text-[11px] text-foreground font-medium">
              Hari ini:{" "}
              <span className="font-bold text-violet-700 dark:text-violet-300">
                {todayHoliday.name}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- CalendarView: state & navigation untuk 2 grid (Hijriah + Masehi) ---

interface CalendarViewProps {
  today: ReturnType<typeof getTodayInfo>;
}

function CalendarView({ today }: CalendarViewProps) {
  const [hijriYear, setHijriYear] = useState(today.hijri.year);
  const [hijriMonth, setHijriMonth] = useState(today.hijri.month);
  const [gregYear, setGregYear] = useState(today.gregorian.year);
  const [gregMonth, setGregMonth] = useState(today.gregorian.month - 1);

  const goPrev = () => {
    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear(hijriYear - 1);
    } else {
      setHijriMonth(hijriMonth - 1);
    }
    if (gregMonth === 0) {
      setGregMonth(11);
      setGregYear(gregYear - 1);
    } else {
      setGregMonth(gregMonth - 1);
    }
  };

  const goNext = () => {
    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear(hijriYear + 1);
    } else {
      setHijriMonth(hijriMonth + 1);
    }
    if (gregMonth === 11) {
      setGregMonth(0);
      setGregYear(gregYear + 1);
    } else {
      setGregMonth(gregMonth + 1);
    }
  };

  const goToday = () => {
    setHijriYear(today.hijri.year);
    setHijriMonth(today.hijri.month);
    setGregYear(today.gregorian.year);
    setGregMonth(today.gregorian.month - 1);
  };

  return (
    <div className="space-y-3">
      <CalendarMonthCard
        header={
          <CalendarHeader
            subtitle="🌙 Hijriah"
            subtitleClassName="text-violet-600 dark:text-violet-400"
            title={`${HIJRI_MONTH_NAMES_ID[hijriMonth]} ${hijriYear} H`}
            onPrev={goPrev}
            onNext={goNext}
          />
        }
      >
        <HijriahMonthGrid
          hijriYear={hijriYear}
          hijriMonth={hijriMonth}
          todayHijri={today.hijri}
        />
      </CalendarMonthCard>

      <CalendarMonthCard
        header={
          <CalendarHeader
            subtitle="📅 Masehi"
            subtitleClassName="text-emerald-600 dark:text-emerald-400"
            title={`${GREGORIAN_MONTH_NAMES[gregMonth]} ${gregYear}`}
            onPrev={goPrev}
            onNext={goNext}
            showTodayButton
            onToday={goToday}
          />
        }
      >
        <GregorianMonthGrid
          gregYear={gregYear}
          gregMonth={gregMonth}
          todayGreg={today.gregorian}
          monthName={GREGORIAN_MONTH_NAMES[gregMonth]}
        />
      </CalendarMonthCard>

      <CalendarLegend />
    </div>
  );
}