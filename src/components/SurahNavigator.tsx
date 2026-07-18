import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Surah } from "@/types/quran";

interface SurahNavigatorProps {
  open: boolean;
  onClose: () => void;
  surahList: Surah[] | undefined;
  currentSurahNumber: number;
}

/**
 * SurahNavigator — dropdown daftar 114 surah untuk navigasi cepat.
 * Muncul saat tombol "Daftar Surat" di halaman SuratDetail diklik.
 *
 * Fitur:
 * - Search by nama Latin, arti, atau nomor
 * - Current surah di-highlight
 * - Klik item → navigasi ke `/surat/{nomor}`
 * - Click outside / Escape untuk tutup
 */
export function SurahNavigator({
  open,
  onClose,
  surahList,
  currentSurahNumber,
}: SurahNavigatorProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input saat open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  // Click outside handler
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // Delay penambahan listener supaya tidak langsung close karena tombol trigger
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    if (!surahList) return [];
    const q = search.trim().toLowerCase();
    if (!q) return surahList;
    return surahList.filter(
      (s) =>
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nomor.toString() === q ||
        s.nama.includes(q),
    );
  }, [surahList, search]);

  const handleSelect = (nomor: number) => {
    onClose();
    navigate(`/surat/${nomor}`);
  };

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-full mt-1 z-50 mx-3 sm:mx-0"
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[80vh] flex flex-col">
        {/* Header + Search */}
        <div className="px-3 py-2.5 border-b border-border/60 bg-gradient-to-br from-emerald-500/8 to-transparent shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              Daftar Surat
            </p>
            <button
              onClick={onClose}
              className="rounded-full h-6 w-6 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Tutup daftar surat"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari surat..."
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Cari surat"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-1.5 flex-1 min-h-0">
          {filtered.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground">
              <Search className="w-5 h-5 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p className="text-xs font-medium">Tidak ada surat yang cocok</p>
              <p className="text-[10px] mt-0.5">Coba kata kunci lain</p>
            </div>
          ) : (
            filtered.map((surah) => {
              const isCurrent = surah.nomor === currentSurahNumber;
              return (
                <button
                  key={surah.nomor}
                  onClick={() => handleSelect(surah.nomor)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors",
                    isCurrent
                      ? "bg-emerald-500/15"
                      : "hover:bg-muted active:scale-[0.99]",
                  )}
                  aria-label={`${surah.nomor}. ${surah.namaLatin}${isCurrent ? " (sedang dibaca)" : ""}`}
                >
                  <span
                    className={cn(
                      "shrink-0 w-7 h-7 rounded-md text-[10px] font-bold tabular-nums flex items-center justify-center",
                      isCurrent
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {surah.nomor}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs font-medium truncate",
                        isCurrent
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-foreground",
                      )}
                    >
                      {surah.namaLatin}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {surah.tempatTurun} • {surah.jumlahAyat} ayat
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      Sedang
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}