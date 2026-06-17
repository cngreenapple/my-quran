import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Sparkles, Clock, BookHeart, Hand } from "lucide-react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SurahCard } from "@/components/SurahCard";
import { LastReadCard } from "@/components/LastReadCard";
import { SurahListSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useSurahList } from "@/hooks/use-surah-list";
import { useDzikirCounter } from "@/hooks/use-dzikir-counter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Index() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, refetch } = useSurahList();
  const { totalCompletedToday } = useDzikirCounter();

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
      label: "Jadwal Sholat",
      icon: Clock,
      color: "from-emerald-500 to-emerald-700",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-600 dark:text-emerald-400",
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
      label: "Kumpulan Doa",
      icon: Hand,
      color: "from-violet-500 to-violet-700",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      text: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background bg-mesh dark:bg-mesh-dark">
      <Header />

      <main className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-5xl">
        {/* Hero Section */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-xl shadow-emerald-500/20">
            <div className="absolute inset-0 opacity-10">
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
                <Sparkles className="w-3 h-3" />
                Al-Qur'an Digital
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
                Baca Al-Qur'an di Mana Saja
              </h1>
              <p className="text-sm sm:text-base text-emerald-50/90 max-w-md leading-relaxed">
                114 surah dengan terjemahan Bahasa Indonesia, audio murottal,
                jadwal sholat, dzikir, dan kumpulan doa.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Akses Cepat
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
                >
                  <Card className="border-border/60 hover:border-primary/40 transition-all group-active:scale-[0.98]">
                    <CardContent className={cn("p-3 sm:p-4 text-center relative", action.bg)}>
                      {action.badge && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                          {action.badge}
                        </span>
                      )}
                      <div
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-md mb-1.5 sm:mb-2",
                          action.color,
                        )}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <p className={cn("text-xs sm:text-sm font-semibold", action.text)}>
                        {action.label}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Last Read Card */}
        <section className="mb-5">
          <LastReadCard />
        </section>

        {/* Search */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Daftar Surat
            </h2>
            {data && (
              <span className="text-xs text-muted-foreground font-medium">
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
        <section>
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
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
              {filteredSurahs.map((surah) => (
                <SurahCard key={surah.nomor} surah={surah} query={query} />
              ))}
            </div>
          )}
        </section>
      </main>

      <AudioPlayer />
    </div>
  );
}