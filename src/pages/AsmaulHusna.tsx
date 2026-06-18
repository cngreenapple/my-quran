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

interface AsmaulHusnaProps {
  onMenuClick: () => void;
}

export default function AsmaulHusna({ onMenuClick }: AsmaulHusnaProps) {
  useDocumentTitle("Asmaul Husna");
  const [query, setQuery] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredAsma = useMemo(() => {
    if (!query.trim()) return ASMAUL_HUSNA;
    const q = query.toLowerCase();
    return ASMAUL_HUSNA.filter((a) => a.latin.toLowerCase().includes(q) || a.meaningId.toLowerCase().includes(q) || a.meaningEn.toLowerCase().includes(q) || a.arabic.includes(q) || a.number.toString() === q);
  }, [query]);

  const selectedAsma = selectedNumber !== null ? ASMAUL_HUSNA.find((a) => a.number === selectedNumber) ?? null : null;

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="asma-title">
        <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full h-8" size="sm">
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="text-xs">Kembali</span>
          </Link>
        </Button>
        <section className="mb-4">
          <h1 id="asma-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" aria-hidden="true" />Asmaul Husna
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">99 nama-nama Allah yang indah</p>
        </section>

        {/* Search + view toggle */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <label htmlFor="asma-search" className="sr-only">Cari asmaul husna</label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input id="asma-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, arti, atau nomor..." className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex p-1 rounded-xl bg-muted shrink-0" role="group" aria-label="Mode tampilan">
            <button onClick={() => setViewMode("grid")} className={cn("h-9 w-9 rounded-lg flex items-center justify-center transition-all", viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")} aria-label="Tampilan grid" aria-pressed={viewMode === "grid"}>
              <Grid3x3 className="w-4 h-4" aria-hidden="true" />
            </button>
            <button onClick={() => setViewMode("list")} className={cn("h-9 w-9 rounded-lg flex items-center justify-center transition-all", viewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")} aria-label="Tampilan daftar" aria-pressed={viewMode === "list"}>
              <ListIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground mb-2.5 px-1 font-medium" aria-live="polite">{filteredAsma.length} dari 99 nama</p>

        {filteredAsma.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3" aria-hidden="true">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground font-medium">Tidak ada nama yang ditemukan</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 animate-fade-in" role="list" aria-label="Daftar Asmaul Husna">
            {filteredAsma.map((asma) => (
              <AsmaulHusnaCard key={asma.number} asma={asma} variant="compact" onClick={() => setSelectedNumber(asma.number)} />
            ))}
          </div>
        ) : (
          <ul className="space-y-2 animate-fade-in" role="list">
            {filteredAsma.map((asma) => (
              <li key={asma.number}><AsmaulHusnaCard asma={asma} onClick={() => setSelectedNumber(asma.number)} /></li>
            ))}
          </ul>
        )}

        <AsmaulHusnaDetailDialog
          asma={selectedAsma}
          open={selectedAsma !== null}
          onOpenChange={(open) => !open && setSelectedNumber(null)}
          onPrev={() => selectedNumber !== null && selectedNumber > 1 && setSelectedNumber(selectedNumber - 1)}
          onNext={() => selectedNumber !== null && selectedNumber < 99 && setSelectedNumber(selectedNumber + 1)}
          hasPrev={selectedNumber !== null && selectedNumber > 1}
          hasNext={selectedNumber !== null && selectedNumber < 99}
        />
      </main>
      <AudioPlayer />
    </div>
  );
}