import { useMemo } from "react";
import { createPortal } from "react-dom";
import { Check, Search, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QueueDropdownItem {
  nomor: number;
  namaLatin: string;
  nama: string;
  tempatTurun: string;
  jumlahAyat: number;
  queueIndex: number;
  isCurrent: boolean;
}

interface QueueDropdownProps {
  open: boolean;
  position: { top: number; left: number; width: number };
  search: string;
  onSearchChange: (s: string) => void;
  items: QueueDropdownItem[];
  totalItems: number;
  listRef: React.RefObject<HTMLDivElement>;
  onItemClick: (queueIndex: number) => void;
  /** Surah yang sedang playing (untuk animated icon) */
  playingSurahNumber: number | null;
}

export function QueueDropdown({
  open,
  position,
  search,
  onSearchChange,
  items,
  totalItems,
  listRef,
  onItemClick,
  playingSurahNumber,
}: QueueDropdownProps) {
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.namaLatin.toLowerCase().includes(q) ||
        item.nomor.toString().includes(q) ||
        item.tempatTurun.toLowerCase().includes(q) ||
        item.nama.includes(q),
    );
  }, [items, search]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-queue-dropdown
      className="fixed z-[60] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
      role="listbox"
      aria-label="Antrian surah"
    >
      <div className="px-3 py-2.5 border-b border-border/60 bg-gradient-to-br from-emerald-500/8 to-transparent">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Antrian Baca
          </p>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {totalItems} surah
          </span>
        </div>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari surah..."
            className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Cari surah dalam antrian"
            autoFocus
          />
        </div>
      </div>

      <div
        ref={listRef}
        className="overflow-y-auto p-1.5"
        style={{ maxHeight: "min(60vh, 480px)" }}
      >
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 px-4 text-muted-foreground">
            <Search className="w-5 h-5 mx-auto mb-2 opacity-50" aria-hidden="true" />
            <p className="text-xs font-medium">Tidak ada surah yang cocok</p>
            <p className="text-[10px] mt-0.5">Coba kata kunci lain</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isPlayingThis =
              item.isCurrent && playingSurahNumber === item.nomor;
            return (
              <button
                key={item.nomor}
                data-current={item.isCurrent}
                onClick={() => onItemClick(item.queueIndex)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors",
                  item.isCurrent
                    ? "bg-emerald-500/15"
                    : "hover:bg-muted active:scale-[0.99]",
                )}
                role="option"
                aria-selected={item.isCurrent}
                aria-label={`${item.nomor}. ${item.namaLatin}${
                  item.isCurrent ? " (sedang diputar)" : ""
                }`}
              >
                <span
                  className={cn(
                    "shrink-0 w-7 h-7 rounded-md text-[10px] font-bold tabular-nums flex items-center justify-center",
                    item.isCurrent
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.nomor}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-medium truncate",
                      item.isCurrent
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-foreground",
                    )}
                  >
                    {item.namaLatin}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {item.tempatTurun} • {item.jumlahAyat} ayat
                  </p>
                </div>
                {item.isCurrent && (
                  <div className="shrink-0">
                    {isPlayingThis ? (
                      <Volume2
                        className="w-3.5 h-3.5 text-emerald-600 animate-pulse"
                        aria-hidden="true"
                      />
                    ) : (
                      <Check
                        className="w-3.5 h-3.5 text-emerald-600"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  );
}