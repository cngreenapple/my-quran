import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Sparkles, Grid3x3, List as ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { AsmaulHusnaCard } from "@/components/AsmaulHusnaCard";
import { AsmaulHusnaDetailDialog } from "@/components/AsmaulHusnaDetailDialog";
import { ASMAUL_HUSNA } from "@/data/asmaul-husna";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

export default function AsmaulHusna() {
  useDocumentTitle("Asmaul Husna");

  const [query, setQuery] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredAsma = useMemo(() => {
    if (!query.trim()) return ASMAUL_HUSNA;
    const q = query.toLowerCase();
    return ASMAUL_HUSNA.filter(
      (a) =>
        a.latin.toLowerCase().includes(q) ||
        a.meaningId.toLowerCase().includes(q) ||
        a.meaningEn.toLowerCase().includes(q) ||
        a.arabic.includes(q) ||
        a.number.toString() === q,
    );
  }, [query]);

  const selectedAsma =
    selectedNumber !== null
      ? ASMAUL_HUSNA.find((a) => a.number === selectedNumber) ?? null
      : null;

  const handleSelect = (n: number) => {
    setSelectedNumber(n);
  };

  const handleClose = () => {
    setSelectedNumber(null);
  };

  const handlePrev = () => {
    if (selectedNumber === null) return;
    const prev = selectedNumber - 1;
    if (prev >= 1) setSelectedNumber(prev);
  };

  const handleNext = () => {
    if (selectedNumber === null) return;
    const next = selectedNumber + 1;
    if (next <= 99) setSelectedNumber(next);
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl"
        aria-labelledby="asma-title"
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
          <h1 id="asma-title" className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-500" aria-hidden="true" />
            Asmaul Husna
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            99 nama-nama Allah yang indah
          </p>
        </section>

        {/* Search & View Toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <label htmlFor="asma-search" className="sr-only">
              Cari asmaul husna
            </label>
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="asma-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, arti, atau nomor..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div
            className="flex p-1 rounded-2xl bg-muted shrink-0"
            role="group"
            aria-label="Mode tampilan"
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                viewMode === "grid"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground",
              )}
              aria-label="Tampilan grid"
              aria-pressed={viewMode === "grid"}
            >
              <Grid3x3 className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                viewMode === "list"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground",
              )}
              aria-label="Tampilan daftar"
              aria-pressed={viewMode === "list"}
            >
              <ListIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-3 px-1" aria-live="polite">
          {filteredAsma.length} dari 99 nama
        </p>

        {/* List */}
        {filteredAsma.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada nama yang ditemukan</p>
          </div>
        ) : viewMode === "grid" ? (
          <div
            className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 animate-fade-in"
            role="list"
            aria-label="Daftar Asmaul Husna"
          >
            {filteredAsma.map((asma) => (
              <AsmaulHusnaCard
                key={asma.number}
                asma={asma}
                variant="compact"
                onClick={() => handleSelect(asma.number)}
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-2 animate-fade-in" role="list">
            {filteredAsma.map((asma) => (
              <li key={asma.number}>
                <AsmaulHusnaCard
                  asma={asma}
                  onClick={() => handleSelect(asma.number)}
                />
              </li>
            ))}
          </ul>
        )}

        <AsmaulHusnaDetailDialog
          asma={selectedAsma}
          open={selectedAsma !== null}
          onOpenChange={(open) => !open && handleClose()}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={selectedNumber !== null && selectedNumber > 1}
          hasNext={selectedNumber !== null && selectedNumber < 99}
        />
      </main>

      <AudioPlayer />
    </div>
  );
}