import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Moon,
  Sun,
  Heart,
  BookOpen,
  RotateCcw,
  Eye,
  Sparkles,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/hooks/use-theme";
import { useLastRead } from "@/hooks/use-last-read";
import { useReadingStats } from "@/hooks/use-reading-stats";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";
import { showSuccess } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  useDocumentTitle("Pengaturan");

  const { theme, setTheme } = useTheme();
  const { lastRead, clearLastRead } = useLastRead();
  const { stats, resetStats } = useReadingStats();
  const { settings, updateSetting } = useAppSettings();

  return (
    <div className="min-h-dvh bg-background bg-mesh dark:bg-mesh-dark">
      <Header />

      <main
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl"
        aria-labelledby="settings-title"
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
          <h1 id="settings-title" className="text-2xl sm:text-3xl font-bold text-foreground">
            Pengaturan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sesuaikan tampilan dan kelola data Anda
          </p>
        </section>

        {/* Appearance */}
        <section className="mb-5" aria-labelledby="tampilan-heading">
          <h2
            id="tampilan-heading"
            className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1 flex items-center gap-2"
          >
            <Palette className="w-3.5 h-3.5" aria-hidden="true" />
            Tampilan
          </h2>

          {/* Dark Mode */}
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">Mode Gelap</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Nyaman untuk membaca di malam hari
                  </p>
                </div>
                <ThemeSwitcher />
              </div>

              <div
                className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/60"
                role="radiogroup"
                aria-label="Pilihan tema"
              >
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-sm font-medium",
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground",
                  )}
                  role="radio"
                  aria-checked={theme === "light"}
                >
                  <Sun className="w-4 h-4" aria-hidden="true" />
                  Terang
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-sm font-medium",
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground",
                  )}
                  role="radio"
                  aria-checked={theme === "dark"}
                >
                  <Moon className="w-4 h-4" aria-hidden="true" />
                  Gelap
                </button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Reading Preferences */}
        <section className="mb-5" aria-labelledby="preferensi-heading">
          <h2
            id="preferensi-heading"
            className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1 flex items-center gap-2"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            Preferensi Bacaan
          </h2>
          <Card className="border-border/60">
            <CardContent className="p-2">
              <button
                onClick={() =>
                  updateSetting("showTransliteration", !settings.showTransliteration)
                }
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                aria-pressed={settings.showTransliteration}
              >
                <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    Tampilkan Transliterasi Latin
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bacaan latin per kata di setiap ayat
                  </p>
                </div>
                <div
                  className={cn(
                    "w-10 h-6 rounded-full p-0.5 transition-colors shrink-0",
                    settings.showTransliteration ? "bg-primary" : "bg-muted-foreground/30",
                  )}
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full bg-white shadow transition-transform",
                      settings.showTransliteration && "translate-x-4",
                    )}
                  />
                </div>
              </button>

              <button
                onClick={() => updateSetting("showVerseOfTheDay", !settings.showVerseOfTheDay)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                aria-pressed={settings.showVerseOfTheDay}
              >
                <Sparkles className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    Tampilkan Ayat Hari Ini
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Widget random ayat di beranda
                  </p>
                </div>
                <div
                  className={cn(
                    "w-10 h-6 rounded-full p-0.5 transition-colors shrink-0",
                    settings.showVerseOfTheDay ? "bg-primary" : "bg-muted-foreground/30",
                  )}
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full bg-white shadow transition-transform",
                      settings.showVerseOfTheDay && "translate-x-4",
                    )}
                  />
                </div>
              </button>
            </CardContent>
          </Card>
        </section>

        {/* Statistics */}
        <section className="mb-5" aria-labelledby="statistik-heading">
          <h2
            id="statistik-heading"
            className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1"
          >
            Statistik
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/60">
              <CardContent className="p-4 text-center">
                <div
                  className="w-10 h-10 mx-auto rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2"
                  aria-hidden="true"
                >
                  <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.longestStreak}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Streak Terpanjang (hari)</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 text-center">
                <div
                  className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2"
                  aria-hidden="true"
                >
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground truncate">
                  {stats.surahsOpened.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Surah Dibuka</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Management */}
        <section className="mb-5" aria-labelledby="data-heading">
          <h2
            id="data-heading"
            className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1"
          >
            Data
          </h2>
          <Card className="border-border/60">
            <CardContent className="p-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left group">
                    <RotateCcw
                      className="w-5 h-5 text-muted-foreground group-hover:text-foreground shrink-0"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        Reset Statistik Bacaan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hapus streak & history bacaan
                      </p>
                    </div>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Statistik?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Statistik bacaan dan history akan dihapus. Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        resetStats();
                        showSuccess("Statistik direset");
                      }}
                      className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <button
                onClick={() => clearLastRead()}
                disabled={!lastRead}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    Hapus Riwayat Terakhir Dibaca
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reset data "Lanjutkan Membaca"
                  </p>
                </div>
              </button>
            </CardContent>
          </Card>
        </section>

        {/* About */}
        <section className="mb-5" aria-labelledby="tentang-heading">
          <h2
            id="tentang-heading"
            className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1"
          >
            Tentang
          </h2>
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Al-Qur'an Digital</h3>
                  <p className="text-xs text-muted-foreground">Versi 1.0.0</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">
                <p>
                  Aplikasi Al-Qur'an digital modern dengan terjemahan Bahasa Indonesia, audio murottal, jadwal sholat, dzikir, doa, Asmaul Husna, dan kalender Hijriah.
                </p>
                <p className="text-xs text-muted-foreground">
                  Data disediakan oleh{" "}
                  <a
                    href="https://equran.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    equran.id
                  </a>{" "}
                  dan audio dari{" "}
                  <a
                    href="https://alquran.cloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    AlQuran Cloud
                  </a>
                  .
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" aria-hidden="true" />
                <span>Dibuat dengan cinta untuk umat Muslim</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <AudioPlayer />
    </div>
  );
}