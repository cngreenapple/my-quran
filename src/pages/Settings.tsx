import { Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Heart, BookOpen, RotateCcw, Eye, Sparkles, Palette } from "lucide-react";
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsProps {
  onMenuClick: () => void;
}

export default function Settings({ onMenuClick }: SettingsProps) {
  useDocumentTitle("Pengaturan");
  const { theme, setTheme } = useTheme();
  const { lastRead, clearLastRead } = useLastRead();
  const { stats, resetStats } = useReadingStats();
  const { settings, updateSetting } = useAppSettings();

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="settings-title">
        <Button variant="ghost" asChild className="mb-2.5 -ml-2 rounded-full h-8" size="sm">
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="text-xs">Kembali</span>
          </Link>
        </Button>
        <section className="mb-4">
          <h1 id="settings-title" className="text-xl sm:text-2xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Sesuaikan tampilan dan kelola data Anda</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Tampilan */}
          <section aria-labelledby="tampilan-heading">
            <h2 id="tampilan-heading" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
              <Palette className="w-3 h-3" aria-hidden="true" />Tampilan
            </h2>
            <Card>
              <CardContent className="p-3.5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                    {theme === "dark" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Mode Gelap</p>
                    <p className="text-[10px] text-muted-foreground">Nyaman untuk membaca di malam hari</p>
                  </div>
                  <ThemeSwitcher />
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-border" role="radiogroup" aria-label="Pilihan tema">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 transition-all text-xs font-medium",
                      theme === "light" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                    )}
                    role="radio"
                    aria-checked={theme === "light"}
                  >
                    <Sun className="w-3.5 h-3.5" aria-hidden="true" />Terang
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 transition-all text-xs font-medium",
                      theme === "dark" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                    )}
                    role="radio"
                    aria-checked={theme === "dark"}
                  >
                    <Moon className="w-3.5 h-3.5" aria-hidden="true" />Gelap
                  </button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Preferensi Bacaan */}
          <section aria-labelledby="preferensi-heading">
            <h2 id="preferensi-heading" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
              <Eye className="w-3 h-3" aria-hidden="true" />Preferensi
            </h2>
            <Card>
              <CardContent className="p-1.5">
                <ToggleRow
                  icon={<BookOpen className="w-4 h-4 text-muted-foreground" />}
                  title="Transliterasi Latin"
                  subtitle="Bacaan latin per ayat"
                  checked={settings.showTransliteration}
                  onChange={() => updateSetting("showTransliteration", !settings.showTransliteration)}
                />
                <div className="h-px bg-border/60 mx-2" />
                <ToggleRow
                  icon={<Sparkles className="w-4 h-4 text-muted-foreground" />}
                  title="Ayat Hari Ini"
                  subtitle="Widget random di beranda"
                  checked={settings.showVerseOfTheDay}
                  onChange={() => updateSetting("showVerseOfTheDay", !settings.showVerseOfTheDay)}
                />
              </CardContent>
            </Card>
          </section>

          {/* Statistik */}
          <section aria-labelledby="statistik-heading">
            <h2 id="statistik-heading" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Statistik</h2>
            <div className="grid grid-cols-2 gap-2">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{stats.longestStreak}</p>
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Streak Terpanjang</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{stats.surahsOpened.length}</p>
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Surah Dibuka</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Data */}
          <section aria-labelledby="data-heading">
            <h2 id="data-heading" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Data</h2>
            <Card>
              <CardContent className="p-1.5">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors text-left">
                      <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">Reset Statistik</p>
                      </div>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Statistik?</AlertDialogTitle>
                      <AlertDialogDescription>Statistik bacaan akan dihapus permanen.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { resetStats(); showSuccess("Statistik direset"); }} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <div className="h-px bg-border/60 mx-2" />
                <button onClick={() => clearLastRead()} disabled={!lastRead} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left">
                  <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">Hapus Riwayat Baca</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Tentang - full width */}
        <section className="mt-3" aria-labelledby="tentang-heading">
          <h2 id="tentang-heading" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Tentang</h2>
          <Card>
            <CardContent className="p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0" aria-hidden="true">
                  <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Al-Qur'an Digital</h3>
                  <p className="text-[10px] text-muted-foreground">Versi 1.0.0</p>
                </div>
                <p className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                  Dibuat <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" /> untuk umat
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <AudioPlayer />
    </div>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ icon, title, subtitle, checked, onChange }: ToggleRowProps) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
      aria-pressed={checked}
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground leading-tight">{title}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{subtitle}</p>}
      </div>
      <div
        className={cn(
          "w-8 h-5 rounded-full p-0.5 transition-colors shrink-0",
          checked ? "bg-primary" : "bg-muted",
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            "w-4 h-4 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-3",
          )}
        />
      </div>
    </button>
  );
}