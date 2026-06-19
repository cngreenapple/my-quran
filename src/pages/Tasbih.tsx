import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUp,
  Hand,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Header } from "@/components/Header";
import { TasbihDial } from "@/components/TasbihDial";
import {
  useTasbihCounter,
  TASBIH_PRESETS,
  type TasbihPreset,
} from "@/hooks/use-tasbih-counter";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface TasbihProps {
  onMenuClick: () => void;
}

const colorMap: Record<TasbihPreset["color"], { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-500/8", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-500/40 border-emerald-500/40" },
  amber: { bg: "bg-amber-500/8", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-500/40 border-amber-500/40" },
  sky: { bg: "bg-sky-500/8", text: "text-sky-700 dark:text-sky-400", ring: "ring-sky-500/40 border-sky-500/40" },
  rose: { bg: "bg-rose-500/8", text: "text-rose-700 dark:text-rose-400", ring: "ring-rose-500/40 border-rose-500/40" },
  violet: { bg: "bg-violet-500/8", text: "text-violet-700 dark:text-violet-400", ring: "ring-violet-500/40 border-violet-500/40" },
};

export default function Tasbih({ onMenuClick }: TasbihProps) {
  useDocumentTitle("Tasbih Digital");
  const { getState, increment, reset, resetAll, totalCyclesToday } = useTasbihCounter();

  const [activePresetId, setActivePresetId] = useState<string>(TASBIH_PRESETS[0].id);
  const [confirmResetAllOpen, setConfirmResetAllOpen] = useState(false);
  const [showJumpToTop, setShowJumpToTop] = useState(false);

  const activePreset = useMemo(
    () => TASBIH_PRESETS.find((p) => p.id === activePresetId) ?? TASBIH_PRESETS[0],
    [activePresetId],
  );
  const state = getState(activePreset);
  const percent = Math.min(100, (state.current / activePreset.target) * 100);
  const isComplete = state.current >= activePreset.target;
  const colors = colorMap[activePreset.color];

  // Count presets yang sudah completed hari ini
  const completedTodayCount = useMemo(() => {
    return TASBIH_PRESETS.filter((p) => {
      const s = getState(p);
      return s.current >= s.target;
    }).length;
  }, [getState, totalCyclesToday]);

  // Jump-to-top visibility — pakai main element scroll listener
  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;

    const handleScroll = () => {
      setShowJumpToTop(mainEl.scrollTop > 300);
    };

    handleScroll(); // Initial check (untuk handle reload saat di-scroll)
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  const handleJumpToTop = () => {
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetAllConfirm = () => {
    resetAll();
    showSuccess("Semua tasbih direset");
    setConfirmResetAllOpen(false);
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main
        className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-2xl"
        aria-labelledby="tasbih-title"
      >
        <Button
          variant="ghost"
          asChild
          className="mb-3 -ml-2 rounded-full h-8"
          size="sm"
        >
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="text-xs">Kembali</span>
          </Link>
        </Button>

        <section className="mb-4">
          <h1
            id="tasbih-title"
            className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2"
          >
            <Hand className="w-6 h-6 text-primary" aria-hidden="true" />
            Tasbih Digital
          </h1>
        </section>

        {/* Stats ringkasan */}
        <Card className="mb-4 border-border/60 bg-gradient-to-r from-primary/5 via-card to-card">
          <CardContent className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Cycle Selesai Hari Ini
                </p>
                <p className="text-lg font-bold text-foreground tabular-nums leading-none mt-0.5">
                  {completedTodayCount}{" "}
                  <span className="text-[10px] text-muted-foreground font-medium">
                    dari {TASBIH_PRESETS.length}
                  </span>
                </p>
              </div>
            </div>
            {completedTodayCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmResetAllOpen(true)}
                className="rounded-full text-destructive hover:text-destructive h-7 text-[10px]"
                aria-label="Reset semua tasbih"
              >
                Reset
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Preset selector — horizontal scroll */}
        <div
          className="-mx-3 px-3 overflow-x-auto no-scrollbar mb-5"
          role="tablist"
          aria-label="Pilih dzikir"
        >
          <div className="flex gap-1.5 min-w-max pb-1">
            {TASBIH_PRESETS.map((preset) => {
              const s = getState(preset);
              const isDone = s.current >= s.target;
              const isActive = activePresetId === preset.id;
              const c = colorMap[preset.color];
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActivePresetId(preset.id)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap border-2 flex items-center gap-1.5",
                    isActive
                      ? cn(c.ring, "shadow-sm")
                      : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
                    isActive && c.bg,
                  )}
                >
                  {isDone && (
                    <Check className="w-3 h-3" aria-hidden="true" />
                  )}
                  <span className={cn(isActive && c.text)}>{preset.name}</span>
                  <span
                    className={cn(
                      "text-[9px] tabular-nums",
                      isActive ? c.text : "text-muted-foreground",
                    )}
                  >
                    {s.current}/{preset.target}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dial card */}
        <Card className={cn("mb-4 border-2 overflow-hidden transition-all", colors.ring, colors.bg)}>
          <CardContent className="p-5 sm:p-6">
            {/* Active dzikir info */}
            <div className="text-center mb-4">
              <p
                className={cn("font-arabic text-2xl sm:text-3xl leading-relaxed", colors.text)}
                dir="rtl"
                lang="ar"
                aria-label={activePreset.name}
              >
                {activePreset.arabic}
              </p>
              <h2 className={cn("text-base sm:text-lg font-bold mt-1", colors.text)}>
                {activePreset.name}
              </h2>
              <p className="text-[11px] text-muted-foreground italic mt-0.5">
                {activePreset.description} • Target {activePreset.target}x
              </p>
            </div>

            {/* Progress dial */}
            <div className="flex justify-center">
              <TasbihDial
                percent={percent}
                current={state.current}
                target={activePreset.target}
                color={activePreset.color}
                onTap={() => increment(activePreset)}
                onReset={() => reset(activePreset)}
                isComplete={isComplete}
              />
            </div>

            {/* Total cycles info */}
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              <span>
                Total siklus terselesaikan:{" "}
                <strong className={cn("tabular-nums", colors.text)}>
                  {state.totalCycles}
                </strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tips card */}
        <Card className="border-border/60 bg-muted/30">
          <CardContent className="p-3.5">
            <div className="flex items-start gap-2.5">
              <div
                className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-base"
                aria-hidden="true"
              >
                💡
              </div>
              <div className="text-[11px] text-foreground/80 leading-relaxed">
                <p className="font-semibold text-foreground mb-0.5">Tips Tasbih:</p>
                <ul className="space-y-0.5 list-disc pl-4 text-muted-foreground">
                  <li>
                    Setelah Subuh & Ashar, Rasulullah ﷺ membaca "Subhanallah walhamdulillah wala ilaha illallah wallahu akbar" 33-33-34 kali.
                  </li>
                  <li>Counter otomatis reset setiap hari (untuk dzikir harian).</li>
                  <li>Tap area untuk hitung, tekan lama untuk reset.</li>
                  <li>Getar otomatis setiap kali target tercapai (33, 66, 99, ...).</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Jump-to-top button — muncul saat scroll > 300px */}
      {showJumpToTop && (
        <button
          type="button"
          onClick={handleJumpToTop}
          className="fixed bottom-24 right-4 z-30 w-11 h-11 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
          aria-label="Scroll ke atas"
        >
          <ArrowUp className="w-5 h-5 text-foreground" aria-hidden="true" />
        </button>
      )}

      <AlertDialog open={confirmResetAllOpen} onOpenChange={setConfirmResetAllOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Semua Tasbih?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua counter tasbih akan direset ke 0. Riwayat total siklus tetap tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAllConfirm}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}