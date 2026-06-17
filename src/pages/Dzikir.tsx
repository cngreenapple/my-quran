import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Sparkles, BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { DzikirCounterCard } from "@/components/DzikirCounterCard";
import { DZIKIR_CATEGORIES, DZIKIR_PAGI, DZIKIR_PETANG } from "@/data/dzikir";
import { useDzikirCounter } from "@/hooks/use-dzikir-counter";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

type DzikirTabId = "pagi" | "petang";

export default function Dzikir() {
  const [activeTab, setActiveTab] = useState<DzikirTabId>("pagi");
  const { resetCategory, getCounter } = useDzikirCounter();

  const activeCategory =
    activeTab === "pagi" ? DZIKIR_PAGI : DZIKIR_PETANG;

  const progress = useMemo(() => {
    const total = activeCategory.items.length;
    const completed = activeCategory.items.filter((item) => {
      const c = getCounter(activeCategory.id, item.id, item.count);
      return c.completed;
    }).length;
    return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
  }, [activeCategory, getCounter]);

  const handleResetCategory = () => {
    if (!confirm(`Reset seluruh dzikir ${activeCategory.name.toLowerCase()}?`)) {
      return;
    }
    resetCategory(activeCategory.id);
    showSuccess(`${activeCategory.name} direset`);
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <BookHeart className="w-7 h-7 text-primary" />
            Dzikir
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Wirid pagi dan petang untuk ketenangan hati
          </p>
        </section>

        {/* Tabs: Pagi / Petang */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-2xl bg-muted">
          {DZIKIR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as DzikirTabId)}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                activeTab === cat.id
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-lg">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Progress Card */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-card p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                Progress {activeCategory.name}
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {progress.completed} / {progress.total}
              </p>
            </div>
            <Sparkles className="w-8 h-8 text-primary/40" />
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 text-center">
          {activeCategory.description}
        </p>

        {/* Reset Button */}
        {progress.completed > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetCategory}
            className="mb-4 mx-auto text-destructive hover:text-destructive rounded-full flex"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset {activeCategory.name}
          </Button>
        )}

        {/* Dzikir List */}
        <div className="space-y-3 animate-fade-in">
          {activeCategory.items.map((item) => (
            <DzikirCounterCard
              key={item.id}
              categoryId={activeCategory.id}
              item={item}
              color={activeCategory.color}
            />
          ))}
        </div>
      </main>

      <AudioPlayer />
    </div>
  );
}