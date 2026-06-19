import { Link } from "react-router-dom";
import { Play, BookOpen, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLastRead } from "@/hooks/use-last-read";
import { useSurahList } from "@/hooks/use-surah-list";
import { showSuccess } from "@/utils/toast";

/**
 * LastReadCard — kartu \"Lanjutkan Baca\" di beranda.
 *
 * FIX glitch layar:
 *
 * Sebelumnya, kartu punya 3 kondisi render yang TIDAK konsisten
 * ukuran-nya:
 *
 *   1. `lastRead == null`              → empty state (icon BookOpen, 2 baris)
 *   2. `surah == undefined` (loading)  → return `null` ❌
 *   3. `surah` ditemukan               → populated state (icon Play + 1 baris)
 *
 * Saat halaman load:
 * - Mount frame 1: `lastRead` kebetulan ada di localStorage, tapi
 *   `surahList` (dari TanStack Query) masih `undefined`. Kondisi #2
 *   return `null` → kartu **menghilang** dari DOM.
 * - Mount frame 2: `surahList` selesai fetch, `surah` ditemukan →
 *   kondisi #3 render → kartu **muncul tiba-tiba**.
 *
 * Hasilnya: layout grid `md:grid-cols-2` shift karena StatsCard di
 * sebelahnya kehilangan pasangan. User lihat \"kedipan\" / glitch.
 *
 * Fix:
 * 1. **Loading state eksplisit** dengan skeleton + `min-h` konsisten
 *    sehingga layout tidak shift saat data fetched.
 * 2. **Defensive fallback** untuk `lastRead` ada tapi `surah` tidak
 *    ketemu (mis. data corrupted). Tampilkan info dasar + tombol hapus
 *    daripada return `null`.
 * 3. **`min-h-[68px]`** di SEMUA state (loading/empty/defensive/populated)
 *    supaya tinggi kartu seragam di grid 2-kolom.
 */
export function LastReadCard() {
  const { lastRead, clearLastRead } = useLastRead();
  const { data: surahList, isLoading } = useSurahList();

  // === 1. Loading state ===
  // Tampilkan skeleton dengan ukuran sama dengan state populated
  // supaya layout tidak shift saat TanStack Query masih fetching.
  if (isLoading) {
    return (
      <div
        className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/60 bg-card min-h-[68px]"
        aria-busy="true"
        aria-label="Memuat riwayat baca"
      >
        <div
          className="shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          aria-hidden="true"
        >
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-2.5 w-20 bg-muted rounded animate-pulse" />
          <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // === 2. Empty state: belum pernah baca ===
  if (!lastRead) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-border/60 bg-muted/20 text-muted-foreground min-h-[68px]">
        <div
          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Terakhir Dibaca
          </p>
          <p className="text-xs">Belum ada — mulai baca dari surat pertama</p>
        </div>
      </div>
    );
  }

  // === 3. Defensive: lastRead ada tapi surah tidak ditemukan di list ===
  // (Edge case: localStorage punya nomor di luar 1-114, atau data API
  // berubah). Jangan return null — tampilkan info dasar + tombol hapus
  // supaya user bisa clear dan mulai ulang.
  const surah = surahList?.find((s) => s.nomor === lastRead.surahNumber);
  if (!surah) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/60 bg-card min-h-[68px]">
        <div
          className="shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          aria-hidden="true"
        >
          <BookOpen className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Riwayat Tersimpan
          </p>
          <p className="text-sm font-semibold text-foreground truncate">
            Surah {lastRead.surahNumber} • Ayat {lastRead.ayatNumber}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            clearLastRead();
            showSuccess("Riwayat dihapus");
          }}
          className="shrink-0 h-7 px-2.5 gap-1 text-[10px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
          aria-label="Hapus riwayat"
        >
          <X className="w-3 h-3" aria-hidden="true" />
          <span className="hidden sm:inline">Hapus</span>
        </Button>
      </div>
    );
  }

  // === 4. Populated state: tampilkan last read dengan link ke surat ===
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearLastRead();
    showSuccess("Riwayat dihapus");
  };

  return (
    <Link
      to={`/surat/${lastRead.surahNumber}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
    >
      <div className="relative flex items-center gap-3 p-3.5 pr-2.5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/10 transition-all active:scale-[0.99] min-h-[68px]">
        {/* Play icon — hover scale */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-emerald-500/40 transition-all"
          aria-hidden="true"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider leading-none mb-1">
            Lanjutkan
          </p>
          <p className="text-sm font-bold text-foreground truncate leading-tight">
            {surah.namaLatin}{" "}
            <span className="text-muted-foreground font-normal">
              • Ayat {lastRead.ayatNumber}
            </span>
          </p>
        </div>

        {/* Hapus — proper IconButton dengan X icon + tap target yang cukup */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="shrink-0 h-7 px-2.5 gap-1 text-[10px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
          aria-label={`Hapus riwayat ${surah.namaLatin} ayat ${lastRead.ayatNumber}`}
        >
          <X className="w-3 h-3" aria-hidden="true" />
          <span className="hidden sm:inline">Hapus</span>
        </Button>
      </div>
    </Link>
  );
}