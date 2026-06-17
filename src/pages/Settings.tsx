import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Moon,
  Sun,
  Info,
  Heart,
  Github,
  BookOpen,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/hooks/use-theme";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useLastRead } from "@/hooks/use-last-read";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { bookmarks, clearBookmarks } = useBookmarks();
  const { lastRead, clearLastRead } = useLastRead();

  return (
    <div className="min-h-screen bg-background bg-mesh dark:bg-mesh-dark">
      <Header />

      <main className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl">
        <Button
          variant="ghost"
          asChild
          className="mb-4 -ml-2 rounded-full"
          size="sm"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali
          </Link>
        </Button>

        <section className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Pengaturan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sesuaikan tampilan dan kelola data Anda
          </p>
        </section>

        {/* Appearance */}
        <section className="mb-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Tampilan
          </h2>
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
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

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/60">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-sm font-medium",
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 text-muted-foreground",
                  )}
                >
                  <Sun className="w-4 h-4" />
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
                >
                  <Moon className="w-4 h-4" />
                  Gelap
                </button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Statistics */}
        <section className="mb-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Statistik
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/60">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                  <Bookmark className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-600/20" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {bookmarks.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Bookmark</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground truncate">
                  {lastRead ? "1" : "0"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Riwayat Baca
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Management */}
        <section className="mb-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Data
          </h2>
          <Card className="border-border/60">
            <CardContent className="p-2">
              <button
                onClick={() => clearLastRead()}
                disabled={!lastRead}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    Hapus Riwayat Terakhir Dibaca
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reset data "Lanjutkan Membaca"
                  </p>
                </div>
              </button>
              <button
                onClick={() => clearBookmarks()}
                disabled={bookmarks.length === 0}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left group"
              >
                <Bookmark className="w-5 h-5 text-muted-foreground group-hover:text-destructive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground group-hover:text-destructive">
                    Hapus Semua Bookmark
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bookmarks.length} bookmark tersimpan
                  </p>
                </div>
              </button>
            </CardContent>
          </Card>
        </section>

        {/* About */}
        <section className="mb-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Tentang
          </h2>
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Al-Qur'an Digital</h3>
                  <p className="text-xs text-muted-foreground">Versi 1.0.0</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">
                <p>
                  Aplikasi Al-Qur'an digital modern dengan terjemahan Bahasa
                  Indonesia, audio murottal, dan fitur bookmark.
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
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
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