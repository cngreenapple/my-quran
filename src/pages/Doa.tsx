import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookHeart, Search, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { DoaCard } from "@/components/DoaCard";
import { DOA_CATEGORIES, DOA_ITEMS, getDoaByCategory } from "@/data/doa";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";
import type { DoaCategory } from "@/types/dzikir";

interface DoaProps {
  onMenuClick: () => void;
}

export default function Doa({ onMenuClick }: DoaProps) {
  useDocumentTitle("Kumpulan Doa");
  const [activeCategory, setActiveCategory] = useState<DoaCategory | "all">("all");
  const [query, setQuery] = useState("");

  const filteredDoas = useMemo(() => {
    let list = activeCategory === "all" ? DOA_ITEMS : getDoaByCategory(activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q) || d.translation.toLowerCase().includes(q) || d.latin.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, query]);

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="doa-title">
        <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full h-8" size="sm">
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="text-xs">Kembali</span>
          </Link>
        </Button>
        <section className="mb-4">
          <h1 id="doa-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Hand className="w-6 h-6 text-primary" aria-hidden="true" />Kumpulan Doa
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Doa harian untuk berbagai kesempatan</p>
        </section>

        {/* Search */}
        <div className="mb-3">
          <label htmlFor="doa-search" className="sr-only">Cari doa</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <input id="doa-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari doa..." className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-4 -mx-3 px-3 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter kategori doa">
          <div className="flex gap-2 pb-1 min-w-max">
            <button onClick={() => setActiveCategory("all")} role="tab" aria-selected={activeCategory === "all"} className={cn("px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border-2", activeCategory === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border/60 bg-card text-muted-foreground hover:text-foreground")}>📚 Semua</button>
            {DOA_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} role="tab" aria-selected={activeCategory === cat.id} className={cn("px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border-2", activeCategory === cat.id ? "border-primary bg-primary text-primary-foreground" : "border-border/60 bg-card text-muted-foreground hover:text-foreground")}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground mb-2.5 px-1 font-medium" aria-live="polite">{filteredDoas.length} doa</p>

        {filteredDoas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3" aria-hidden="true">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground font-medium">Tidak ada doa yang ditemukan</p>
            <p className="text-xs text-muted-foreground mt-1">Coba kata kunci lain</p>
          </div>
        ) : (
          <ul className="space-y-2.5 animate-fade-in" role="list">
            {filteredDoas.map((doa) => <li key={doa.id}><DoaCard doa={doa} /></li>)}
          </ul>
        )}
      </main>
      <AudioPlayer />
    </div>
  );
}