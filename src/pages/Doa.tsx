import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookHeart, Search, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { DoaCard } from "@/components/DoaCard";
import { DOA_CATEGORIES, DOA_ITEMS, getDoaByCategory } from "@/data/doa";
import { cn } from "@/lib/utils";
import type { DoaCategory } from "@/types/dzikir";

export default function Doa() {
  const [activeCategory, setActiveCategory] = useState<DoaCategory | "all">("all");
  const [query, setQuery] = useState("");

  const filteredDoas = useMemo(() => {
    let list = activeCategory === "all" ? DOA_ITEMS : getDoaByCategory(activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.translation.toLowerCase().includes(q) ||
          d.latin.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeCategory, query]);

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
            <Hand className="w-7 h-7 text-primary" />
            Kumpulan Doa
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Doa harian untuk berbagai kesempatan
          </p>
        </section>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari doa..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-border/60 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-5 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-2 min-w-max">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                activeCategory === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              📚 Semua
            </button>
            {DOA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                  activeCategory === cat.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-3 px-1">
          {filteredDoas.length} doa
        </p>

        {/* Doa List */}
        {filteredDoas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada doa yang ditemukan</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {filteredDoas.map((doa) => (
              <DoaCard key={doa.id} doa={doa} />
            ))}
          </div>
        )}
      </main>

      <AudioPlayer />
    </div>
  );
}