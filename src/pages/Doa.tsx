import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookHeart, Search, Hand, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { DoaCard } from "@/components/DoaCard";
import { ErrorState } from "@/components/ErrorState";
import { useDoaList } from "@/hooks/use-doalist";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";
import type { DoaItem } from "@/types/dzikir";

interface DoaProps {
  onMenuClick: () => void;
}

/**
 * Mapping icon & color untuk grup doa.
 * Gunakan predetermined mapping atau fallback emoji.
 */
function getGroupMeta(grup: string): { icon: string; color: string } {
  const map: Record<string, { icon: string; color: string }> = {
    "Doa Sebelum dan Sesudah Tidur": { icon: "🌙", color: "violet" },
    "Doa di Kamar Mandi": { icon: "🚿", color: "sky" },
    "Doa Saat Wudhu": { icon: "💧", color: "sky" },
    "Doa Berpakaian": { icon: "👕", color: "amber" },
    "Doa Perlindungan": { icon: "🛡️", color: "rose" },
    "Doa Menghadapi Fenomena Alam": { icon: "🌤️", color: "sky" },
    "Doa Pernikahan": { icon: "💍", color: "emerald" },
    "Doa Saat Sakit": { icon: "🤒", color: "rose" },
    "Doa untuk Orang Sakit": { icon: "🤲", color: "emerald" },
    "Doa Menjelang Wafat": { icon: "🕊️", color: "violet" },
    "Doa Jenazah": { icon: "⚰️", color: "violet" },
    "Doa Saat Sedih dan Sulit": { icon: "😢", color: "rose" },
    "Doa Saat Mendapat Kabar": { icon: "📨", color: "amber" },
    "Doa Terkait Harta dan Hutang": { icon: "💰", color: "amber" },
    "Doa Perjalanan": { icon: "✈️", color: "sky" },
    "Doa Berlindung dari setan": { icon: "🔥", color: "violet" },
    "Doa memohon surga dan berlindung dari neraka": { icon: "⛅", color: "emerald" },
    "Doa memohon akhlak mulia": { icon: "💎", color: "emerald" },
    "Doa Terkait Orang Tua": { icon: "👴", color: "rose" },
    "Doa Terkait Istri Dan Anak": { icon: "👨‍👩‍👧‍👦", color: "emerald" },
    "Doa Kepada Anak Yang Baru Lahir": { icon: "🍼", color: "sky" },
    "Doa Memohon Keteguhan Hati": { icon: "❤️", color: "rose" },
    "Doa Memohon Ampun, Rahmat Dan Kebaikan Lainnya": { icon: "🙏", color: "emerald" },
    "Doa Berlindung Dari Syirik": { icon: "☝️", color: "emerald" },
    "Doa Berlindung Dari Empat Hal": { icon: "🛡️", color: "violet" },
    "Doa Berlindung Dari Kecelakaan Dan Kematian Yang Mengerikan": { icon: "⚠️", color: "rose" },
    "Doa Memohon Ilmu": { icon: "📚", color: "sky" },
    "Doa Memohon Kebaikan": { icon: "✨", color: "emerald" },
    "Bacaan Bila Kagum Terhadap Sesuatu": { icon: "😮", color: "amber" },
    "Beberapa Adab Dan Keutamaan": { icon: "📜", color: "amber" },
    "Istighfar Dan Taubat": { icon: "🕋", color: "emerald" },
    "Lafal Dzikir Dan Keutamaannya": { icon: "📿", color: "emerald" },
    "Doa Terkait Majelis": { icon: "🪑", color: "violet" },
    "Doa Bertemu Musuh Dan Penguasa": { icon: "⚔️", color: "rose" },
    "Doa Berlindung Dari Orang Zalim Dan Orang Kafir": { icon: "🛡️", color: "rose" },
    "Beberapa Doa Terkait Shalat": { icon: "🕌", color: "emerald" },
    "Doa Terkait Makan": { icon: "🍽️", color: "amber" },
    "Doa Terkait Puasa": { icon: "🌙", color: "violet" },
    "Doa Terkait Ramadhan": { icon: "☪️", color: "emerald" },
    "Ucapan Terkait Hari Raya.": { icon: "🎉", color: "emerald" },
    "Doa Berlindung Dari Keburukan": { icon: "🛡️", color: "rose" },
    "Doa Memohon Kebaikan Dan Berlindung Dari Keburukan": { icon: "🤲", color: "emerald" },
    "Doa Keluar Dan Masuk Rumah": { icon: "🏠", color: "amber" },
    "Bacaan Terkait Adzan": { icon: "📢", color: "sky" },
    "Beberapa Doa Dan Keutamaan": { icon: "📜", color: "amber" },
  };
  return map[grup] ?? { icon: "📖", color: "emerald" };
}

export default function Doa({ onMenuClick }: DoaProps) {
  useDocumentTitle("Kumpulan Doa");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [query, setQuery] = useState("");

  const { data: apiDoa, isLoading, isError, refetch } = useDoaList();

  // Ekstrak kategori unik dari grup
  const categories = useMemo(() => {
    if (!apiDoa) return [];
    const seen = new Set<string>();
    return apiDoa
      .filter((d) => {
        if (seen.has(d.grup)) return false;
        seen.add(d.grup);
        return true;
      })
      .map((d) => ({
        id: d.grup,
        name: d.grup,
        icon: getGroupMeta(d.grup).icon,
        color: getGroupMeta(d.grup).color as DoaItem["color"],
      }));
  }, [apiDoa]);

  // Map API data ke DoaItem
  const doaItems: DoaItem[] = useMemo(() => {
    if (!apiDoa) return [];
    return apiDoa.map((d) => ({
      id: `doa-${d.id}`,
      title: d.nama,
      arabic: d.ar,
      latin: d.tr,
      translation: d.idn,
      category: d.grup,
      catatan: d.tentang,
    }));
  }, [apiDoa]);

  // Filter berdasarkan kategori dan search
  const filteredDoas = useMemo(() => {
    let list = doaItems;
    if (activeCategory !== "all") {
      list = list.filter((d) => d.category === activeCategory);
    }
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
  }, [doaItems, activeCategory, query]);

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
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading ? "Memuat..." : `${doaItems.length} doa dari berbagai sumber`}
          </p>
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
        {!isLoading && categories.length > 0 && (
          <div className="mb-4 -mx-3 px-3 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filter kategori doa">
            <div className="flex gap-2 pb-1 min-w-max">
              <button
                onClick={() => setActiveCategory("all")}
                role="tab"
                aria-selected={activeCategory === "all"}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border-2",
                  activeCategory === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                📚 Semua ({doaItems.length})
              </button>
              {categories.map((cat) => {
                const count = doaItems.filter((d) => d.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    role="tab"
                    aria-selected={activeCategory === cat.id}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border-2",
                      activeCategory === cat.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {cat.icon} {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground" aria-busy="true">
            <Loader2 className="w-7 h-7 mx-auto mb-3 animate-spin" aria-hidden="true" />
            <p className="text-sm">Memuat doa...</p>
          </div>
        ) : isError ? (
          <ErrorState
            title="Gagal Memuat Doa"
            message="Tidak dapat terhubung ke server. Periksa koneksi Anda dan coba lagi."
            onRetry={() => refetch()}
          />
        ) : filteredDoas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3" aria-hidden="true">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground font-medium">Tidak ada doa yang ditemukan</p>
            <p className="text-xs text-muted-foreground mt-1">Coba kata kunci lain</p>
          </div>
        ) : (
          <ul className="space-y-2.5 animate-fade-in" role="list">
            {filteredDoas.map((doa) => (
              <li key={doa.id}>
                <DoaCard doa={doa} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <AudioPlayer />
    </div>
  );
}