import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, BookOpen, Clock, BookHeart, Hand, Star,
  Compass, Moon, ArrowRight, Calendar,
} from "lucide-react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SurahCard } from "@/components/SurahCard";
import { LastReadCard } from "@/components/LastReadCard";
import { StatsCard } from "@/components/StatsCard";
import { VerseOfTheDay } from "@/components/VerseOfTheDay";
import { IslamicCalendarCard } from "@/components/IslamicCalendarCard";
import { SurahListSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { FullQuranPlayer } from "@/components/full-quran/FullQuranPlayer";
import { useSurahList } from "@/hooks/use-surah-list";
import { useDzikirCounter } from "@/hooks/use-dzikir-counter";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { ASMAUL_HUSNA } from "@/data/asmaul-husna";
import { getTodayInfo, formatFullDate } from "@/lib/date";
import { cn } from "@/lib/utils";

interface IndexProps {
  onMenuClick: () => void;
}

const QUICK_ACTIONS = [
  { to: "/jadwal-sholat", label: "Sholat", icon: Clock, color: "emerald" },
  { to: "/dzikir", label: "Dzikir", icon: BookHeart, color: "amber", badgeKey: "dzikir" as const },
  { to: "/doa", label: "Doa", icon: Hand, color: "violet" },
  { to: "/asmaul-husna", label: "Asmaul", icon: Star, color: "rose" },
  { to: "/arah-kiblat", label: "Kiblat", icon: Compass, color: "sky" },
  { to: "/kalender", label: "Kalender", icon: Calendar, color: "violet" },
  { to: "/puasa-sunnah", label: "Puasa", icon: Moon, color: "violet" },
  { to: "/bookmark", label: "Bookmark", icon: BookOpen, color: "amber" },
] as const;

const colorMap = {
  emerald: { bg: "bg-emerald-500/8", text: "text-emerald-600 dark:text-emerald-400", grad: "from-emerald-500 to-emerald-700" },
  amber: { bg: "bg-amber-500/8", text: "text-amber-600 dark:text-amber-400", grad: "from-amber-500 to-amber-700" },
  sky: { bg: "bg-sky-500/8", text: "text-sky-600 dark:text-sky-400", grad: "from-sky-500 to-sky-700" },
  rose: { bg: "bg-rose-500/8", text: "text-rose-600 dark:text-rose-400", grad: "from-rose-500 to-rose-700" },
  violet: { bg: "bg-violet-500/8", text: "text-violet-600 dark:text-violet-400", grad: "from-violet-500 to-violet-700" },
};

export default function Index({ onMenuClick }: IndexProps) {
  useDocumentTitle();

  const [query, setQuery] = useState("");
  const { data, isLoading, isError, refetch } = useSurahList();
  const { totalCompletedToday } = useDzikirCounter();
  const { settings } = useAppSettings();

  const asmaOfTheDay = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return ASMAUL_HUSNA[dayOfYear % ASMAUL_HUSNA.length];
  }, []);

  const todayInfo = useMemo(() => getTodayInfo(), []);

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

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-1.5 focus:bg-primary focus:text-primary-foreground focus:rounded-full focus:shadow-lg focus:outline-none focus:text-sm"
      >
        Lewati ke konten
      </a>

      <Header onMenuClick={onMenuClick} />

      <main
        id="main-content"
        className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-5xl"
        aria-labelledby="hero-title"
      >
        <section className="mb-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 shadow-lg shadow-emerald-500/20">
            <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hp" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
                    <path d="M18 0 L36 18 L18 36 L0 18 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hp)" />
              </svg>
            </div>

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100/80 mb-0.5">
                  {todayInfo.gregorian.weekday}
                </p>
                <h1
                  id="hero-title"
                  className="text-base sm:text-lg font-bold leading-tight mb-0.5"
                >
                  Assalamu'alaikum
                </h1>
                <p className="text-[11px] text-emerald-50/80">
                  {formatFullDate(new Date()).split(", ")[1]} • {todayInfo.hijri.day} {todayInfo.hijri.monthName} {todayInfo.hijri.year} H
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="font-arabic text-xl sm:text-2xl text-emerald-50/90 leading-none"
                  dir="rtl"
                  lang="ar"
                >
                  {todayInfo.hijri.monthArabic}
                </p>
                <p className="text-[10px] text-emerald-100/70 font-medium mt-0.5">
                  {asmaOfTheDay.latin} ✨
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-3" aria-label="Mode baca Al-Qur'an full">
          <FullQuranPlayer />
        </section>

        <section className="mb-4" aria-label="Akses cepat">
          <nav aria-label="Menu akses cepat">
            <ul className="grid grid-cols-4 sm:grid-cols-4 gap-2" role="list">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                const c = colorMap[action.color];
                const badge = action.badgeKey === "dzikir" && totalCompletedToday > 0 ? totalCompletedToday : null;
                return (
                  <li key={action.to}>
                    <Link
                      to={action.to}
                      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
                      aria-label={action.label}
                    >
                      <div
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-all active:scale-95",
                          c.bg,
                        )}
                      >
                        {badge && (
                          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-md">
                            {badge}
                          </span>
                        )}
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm",
                            c.grad,
                          )}
                          aria-hidden="true"
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <p className={cn("text-[10px] font-semibold leading-none", c.text)}>
                          {action.label}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </section>

        <section className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Ringkasan">
          <StatsCard />
          <LastReadCard />
        </section>

        <section className="mb-4" aria-label="Kalender Islam">
          <IslamicCalendarCard />
        </section>

        {settings.showVerseOfTheDay && (
          <section className="mb-4" aria-label="Ayat hari ini">
            <VerseOfTheDay />
          </section>
        )}

        <section className="mb-4" aria-label="Asmaul Husna hari ini">
          <Link
            to="/asmaul-husna"
            className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
          >
            <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/8 via-amber-500/4 to-transparent hover:border-amber-500/40 transition-all active:scale-[0.99]">
              <p
                className="font-arabic text-3xl sm:text-4xl text-foreground leading-none shrink-0"
                dir="rtl"
                lang="ar"
                aria-label={`${asmaOfTheDay.latin}: ${asmaOfTheDay.meaningId}`}
              >
                {asmaOfTheDay.arabic}
              </p>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">
                  ✨ Asmaul Husna #{asmaOfTheDay.number}
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {asmaOfTheDay.latin} — {asmaOfTheDay.meaningId}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
            </div>
          </Link>
        </section>

        <section className="mb-3">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
              Daftar Surat
            </h2>
            {data && (
              <span className="text-[11px] text-muted-foreground font-medium tabular-nums" aria-live="polite">
                {filteredSurahs.length}/114
              </span>
            )}
          </div>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Cari nama, arti, atau nomor..."
          />
        </section>

        <section aria-label="Daftar 114 surah Al-Qur'an">
          {isLoading ? (
            <SurahListSkeleton count={8} />
          ) : isError ? (
            <ErrorState
              title="Gagal Memuat"
              message="Tidak dapat terhubung ke server. Periksa koneksi Anda dan coba lagi."
              onRetry={() => refetch()}
            />
          ) : filteredSurahs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2.5" aria-hidden="true">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground font-medium mb-0.5">Tidak ditemukan</p>
              <p className="text-xs text-muted-foreground">Tidak ada surat yang cocok dengan "{query}"</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-fade-in" role="list">
              {filteredSurahs.map((surah) => (
                <li key={surah.nomor}>
                  <SurahCard surah={surah} query={query} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}