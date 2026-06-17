import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Sparkles,
  Clock,
  BookHeart,
  Hand,
  Star,
  Calendar,
} from "lucide-react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SurahCard } from "@/components/SurahCard";
import { LastReadCard } from "@/components/LastReadCard";
import { StatsCard } from "@/components/StatsCard";
import { VerseOfTheDay } from "@/components/VerseOfTheDay";
import { SurahListSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useSurahList } from "@/hooks/use-surah-list";
import { useDzikirCounter } from "@/hooks/use-dzikir-counter";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { ASMAUL_HUSNA } from "@/data/asmaul-husna";
import { getTodayInfo, getUpcomingEvents, formatFullDate } from "@/lib/hijri-calendar";
import { cn } from "@/lib/utils";

export default function Index() {
  useDocumentTitle();

  const [query, setQuery] = useState("");
  const { data, isLoading, isError, refetch } = useSurahList();
  const { totalCompletedToday } = useDzikirCounter();
  const { settings } = useAppSettings();
  const [asmaOfTheDay, setAsmaOfTheDay] = useState(ASMAUL_HUSNA[0]);
  const [todayInfo, setTodayInfo] = useState(() => getTodayInfo());
  const [upcoming, setUpcoming] = useState(() => getUpcomingEvents({ daysAhead: 30 }).slice(0, 1));

  // Asma of the day: rotate based on day of year
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const idx = dayOfYear % ASMAUL_HUSNA.length;
    setAsmaOfTheDay(ASMAUL_HUSNA[idx]);
    setTodayInfo(getTodayInfo());
    setUpcoming(getUpcomingEvents({ daysAhead: 30 }).slice(0, 1));
  }, []);

  const filteredSurahs = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (s) =>
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nomor.toString() === q ||
        s.nama.includes(q),
    );
  }, [data, query]);

  const quickActions = [
    {
      to: "/jadwal-sholat",
      label: "Sholat",
      icon: Clock,
      color: "from-emerald-500 to-emerald-700",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
      badge: null as string | null,
    },
    {
      to: "/dzikir",
      label: "Dzikir",
      icon: BookHeart,
      color: "from-amber-500 to-amber-700",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-600 dark:text-amber-400",
      badge: totalCompletedToday > 0 ? `${totalCompletedToday}` : null,
    },
    {
      to: "/doa",
      label: "Doa",
      icon: Hand,
      color: "from-violet-500 to-violet-700",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      text: "text-violet-600 dark:text-violet-400",
      badge: null,
    },
    {
      to: "/asmaul-husna",
      label: "Asmaul Husna",
      icon: Star,
      color: "from-rose-500 to-rose-700",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-600 dark:text-rose-400",
      badge: null,
    },
    {
      to: "/kalender",
      label: "Kalender",
      icon: Calendar,
      color: "from-sky-500 to-sky-700",
      bg: "bg-sky-50 dark:bg-sky-950/30",
      text: "text-sky-600 dark:text-sky-400",
      badge: null,
    },
  ];

  return (
    <div className="min-h-dvh bg-background bg-mesh dark:bg-mesh-dark">
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-full focus:shadow-lg focus:outline-none"
      >
        Lewati ke konten utama
      </a>

      <Header />

      <main
        id="main-content"
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-5xl"
        aria-labelledby="hero-title"
      >
        {/* Hero Section */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-xl shadow-emerald-500/20">
            <div className="absolute inset-0 opacity-10" aria-hidden="true">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="islamic-pattern"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M20 0 L40 20 L20 40 L0 20 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
              </svg>
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                Al-Qur'an Digital
              </div>
              <h1
                id="hero-title"
                className="text-2xl sm:text-3xl font-bold mb-2 leading-tight"
              >
                Baca Al-Qur'an di Mana Saja
              </h1>
              <p className="text-sm sm:text-base text-emerald-50/90 max-w-md leading-relaxed">
                114 surah dengan terjemahan, audio murottal, jadwal sholat, dzikir, doa, Asmaul Husna, dan kalender Hijriah.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Card */}
        <section className="mb-5" aria-label="Statistik bacaan Anda">
          <StatsCard />
        </section>

        {/* Quick Actions */}
        <section className="mb-5" aria-labelledby="quick-actions-heading">
          <h2
            id="quick-actions-heading"
            className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1"
          >
            Akses Cepat
          </h2>
          <nav aria-label="Menu akses cepat">
            <ul className="grid grid-cols-5 gap-2 sm:gap-3" role="list">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <li key={action.to}>
                    <Link
                      to={action.to}
                      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
                      aria-label={`Buka halaman ${action.label}`}
                    >
                      <Card className="border-border/60 hover:border-primary/40 transition-all group-active:scale-[0.95]">
                        <CardContent className={cn("p-2 sm:p-3 text-center relative", action.bg)}>
                          {action.badge && (
                            <span
                              className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                              aria-label={`${action.badge} item selesai`}
                            >
                              {action.badge}
                            </span>
                          )}
                          <div
                            className={cn(
                              "w-9 h-9 sm:w-11 sm:h-11 mx-auto rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md mb-1.5",
                              action.color,
                            )}
                            aria-hidden="true"
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <p className={cn("text-[9px] sm:text-[11px] font-semibold leading-tight", action.text)}>
                            {action.label}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </section>

        {/* Verse of the Day */}
        {settings.showVerseOfTheDay && (
          <section className="mb-5" aria-label="Ayat hari ini">
            <VerseOfTheDay />
          </section>
        )}

        {/* Today Widget */}
        <section className="mb-5" aria-label="Tanggal hari ini">
          <Link
            to="/kalender"
            className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-3xl"
            aria-label="Lihat kalender Hijriah lengkap"
          >
            <Card className="overflow-hidden border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-card to-card hover:shadow-lg transition-all group-active:scale-[0.99]">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      Hari Ini
                    </p>
                  </div>
                  {upcoming[0] && (
                    <span
                      className="text-[10px] font-medium text-muted-foreground"
                      aria-live="polite"
                    >
                      {upcoming[0].daysUntil === 0
                        ? `🎉 ${upcoming[0].holiday.name}`
                        : `${upcoming[0].daysUntil} hari lagi: ${upcoming[0].holiday.name}`}
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {todayInfo.gregorian.weekday}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {formatFullDate(new Date()).split(", ")[1]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-arabic text-xl sm:text-2xl text-sky-600 dark:text-sky-400 leading-tight"
                      dir="rtl"
                      lang="ar"
                    >
                      {todayInfo.hijri.monthArabic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {todayInfo.hijri.day} {todayInfo.hijri.year} H
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Asmaul Husna of the Day */}
        <section className="mb-5" aria-label="Asmaul Husna hari ini">
          <Link
            to="/asmaul-husna"
            className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-3xl"
            aria-label="Lihat semua Asmaul Husna"
          >
            <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent hover:shadow-lg hover:shadow-amber-500/10 transition-all group-active:scale-[0.99]">
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" aria-hidden="true" />
                      Asmaul Husna Hari Ini
                    </p>
                    <p className="text-xs text-muted-foreground">
                      #{asmaOfTheDay.number} / 99
                    </p>
                  </div>
                  <p
                    className="font-arabic text-3xl sm:text-4xl text-foreground leading-tight"
                    dir="rtl"
                    lang="ar"
                    aria-label={`${asmaOfTheDay.latin}: ${asmaOfTheDay.meaningId}`}
                  >
                    {asmaOfTheDay.arabic}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <p className="text-base font-bold text-foreground">
                    {asmaOfTheDay.latin}
                  </p>
                  <p className="text-sm text-foreground/80 mt-0.5">
                    {asmaOfTheDay.meaningId}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Last Read Card */}
        <section className="mb-5" aria-label="Terakhir dibaca">
          <LastReadCard />
        </section>

        {/* Search */}
        <section className="mb-5" aria-labelledby="surah-list-heading">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="surah-list-heading"
              className="text-lg font-bold text-foreground flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
              Daftar Surat
            </h2>
            {data && (
              <span
                className="text-xs text-muted-foreground font-medium"
                aria-live="polite"
              >
                {filteredSurahs.length} dari 114
              </span>
            )}
          </div>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Cari nama, arti, atau nomor surat..."
          />
        </section>

        {/* Surah List */}
        <section aria-label="Daftar 114 surah Al-Qur'an">
          {isLoading ? (
            <SurahListSkeleton count={8} />
          ) : isError ? (
            <ErrorState
              title="Gagal Memuat Daftar Surat"
              message="Tidak dapat terhubung ke server. Periksa koneksi Anda dan coba lagi."
              onRetry={() => refetch()}
            />
          ) : filteredSurahs.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Tidak ditemukan
              </h3>
              <p className="text-sm text-muted-foreground">
                Tidak ada surat yang cocok dengan "{query}"
              </p>
            </div>
          ) : (
            <ul
              className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in"
              role="list"
            >
              {filteredSurahs.map((surah) => (
                <li key={surah.nomor}>
                  <SurahCard surah={surah} query={query} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <AudioPlayer />
    </div>
  );
}