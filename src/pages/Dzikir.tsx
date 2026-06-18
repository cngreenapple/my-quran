import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Sparkles, BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { AudioPlayer } from "@/components/AudioPlayer";
import { DzikirCounterCard } from "@/components/DzikirCounterCard";
import { DZIKIR_CATEGORIES, DZIKIR_PAGI, DZIKIR_PETANG } from "@/data/dzikir";
import { useDzikirCounter } from "@/hooks/use-dzikir-counter";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

type DzikirTabId = "pagi" | "petang";

interface DzikirProps {
  onMenuClick: () => void;
}

export default function Dzikir({ onMenuClick }: DzikirProps) {
  useDocumentTitle("Dzikir Pagi & Petang");
  const [activeTab, setActiveTab] = useState<DzikirTabId>("pagi");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const { resetCategory, getCounter } = useDzikirCounter();
  const activeCategory = activeTab === "pagi" ? DZIKIR_PAGI : DZIKIR_PETANG;

  const progress = useMemo(() => {
    const total = activeCategory.items.length;
    const completed = activeCategory.items.filter((item) => {
      const c = getCounter(activeCategory.id, item.id, item.count);
      return c.completed;
    }).length;
    return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
  }, [activeCategory, getCounter]);

  const handleResetConfirm = () => {
    resetCategory(activeCategory.id);
    showSuccess(`${activeCategory.name} direset`);
    setResetConfirmOpen(false);
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="dzikir-title">
        <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full h-8" size="sm">
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="text-xs">Kembali</span>
          </Link>
        </Button>
        <section className="mb-4">
          <h1 id="dzikir-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <BookHeart className="w-6 h-6 text-primary" aria-hidden="true" />Dzikir
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Wirid pagi dan petang untuk ketenangan hati</p>
        </section>

        <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-2xl bg-muted" role="tablist" aria-label="Pilih waktu dzikir">
          {DZIKIR_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id as DzikirTabId)} role="tab" aria-selected={activeTab === cat.id} aria-controls={`panel-${cat.id}`} className={cn("flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all", activeTab === cat.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <span className="text-base" aria-hidden="true">{cat.emoji}</span>{cat.name}
            </button>
          ))}
        </div>

        {/* Progress card (compact) */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-card p-3.5 mb-4" role="status" aria-live="polite">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Progress {activeCategory.name}</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{progress.completed} <span className="text-sm text-muted-foreground font-normal">/ {progress.total}</span></p>
            </div>
            <Sparkles className="w-7 h-7 text-primary/40" aria-hidden="true" />
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress.percent)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress dzikir ${progress.percent.toFixed(0)} persen`}>
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3 text-center">{activeCategory.description}</p>

        {progress.completed > 0 && (
          <div className="flex justify-center mb-3">
            <Button variant="ghost" size="sm" onClick={() => setResetConfirmOpen(true)} className="text-destructive hover:text-destructive rounded-full h-7 text-xs" aria-label={`Reset progress dzikir ${activeCategory.name}`}>
              <RotateCcw className="w-3 h-3 mr-1.5" aria-hidden="true" />Reset {activeCategory.name}
            </Button>
          </div>
        )}

        <div className="space-y-3 animate-fade-in" role="tabpanel" id={`panel-${activeCategory.id}`} aria-labelledby={`tab-${activeCategory.id}`}>
          {activeCategory.items.map((item) => (
            <DzikirCounterCard key={item.id} categoryId={activeCategory.id} item={item} color={activeCategory.color} />
          ))}
        </div>
      </main>

      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Dzikir {activeCategory.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus seluruh progress counter dzikir {activeCategory.name.toLowerCase()}.
              Riwayat totalCompleted akan tetap dipertahankan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetConfirm}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AudioPlayer />
    </div>
  );
}