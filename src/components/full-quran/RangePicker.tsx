Sampai) dengan warning indicator. Tampilkan dalam emerald card aesthetic.">
import { useMemo } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RangePickerProps {
  fromNomor: number;
  toNomor: number;
  onFromChange: (n: number) => void;
  onToChange: (n: number) => void;
  onPlay: () => void;
  onCancel: () => void;
  surahList: { nomor: number; namaLatin: string }[] | undefined;
}

/**
 * Pilih rentang surah — 2 stepper dengan subtitle nama latin + ringkasan rentang.
 *
 * Support input terbalik (Dari > Sampai): normalize ke display order, dengan
 * warning indicator supaya user sadar.
 *
 * Lookup nama latin via prop `surahList` — kalau belum loaded, stepper tetap
 * jalan tapi tanpa subtitle nama.
 */
export function RangePicker({
  fromNomor,
  toNomor,
  onFromChange,
  onToChange,
  onPlay,
  onCancel,
  surahList,
}: RangePickerProps) {
  // Lookup nama latin dari nomor
  const fromSurah = useMemo(
    () => surahList?.find((s) => s.nomor === fromNomor),
    [surahList, fromNomor],
  );
  const toSurah = useMemo(
    () => surahList?.find((s) => s.nomor === toNomor),
    [surahList, toNomor],
  );

  const totalCount = Math.abs(toNomor - fromNomor) + 1;
  const isReversed = fromNomor > toNomor;
  const displayFrom = Math.min(fromNomor, toNomor);
  const displayTo = Math.max(fromNomor, toNomor);

  return (
    <div className="space-y-2 animate-fade-in">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Pilih rentang surah
      </p>
      <div className="grid grid-cols-2 gap-2">
        <RangeStepper
          label="Dari"
          value={fromNomor}
          namaLatin={fromSurah?.namaLatin}
          onChange={onFromChange}
        />
        <RangeStepper
          label="Sampai"
          value={toNomor}
          namaLatin={toSurah?.namaLatin}
          onChange={onToChange}
        />
      </div>

      {/* Ringkasan rentang */}
      <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2 space-y-0.5">
        <p className="text-[10px] text-muted-foreground leading-tight">
          Akan memutar {totalCount} surah:
        </p>
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 leading-tight">
          {displayFrom}. {fromNomor === displayFrom ? fromSurah?.namaLatin : toSurah?.namaLatin}
          {displayFrom !== displayTo && (
            <>
              {" → "}
              {displayTo}. {toNomor === displayTo ? toSurah?.namaLatin : fromSurah?.namaLatin}
            </>
          )}
        </p>
        {isReversed && (
          <p className="text-[9px] text-amber-600 dark:text-amber-400 leading-tight italic">
            ⚠️ Urutan terbalik — akan diputar dari {displayTo} ke {displayFrom}
          </p>
        )}
      </div>

      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="rounded-full flex-1 h-8 text-xs"
        >
          Batal
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onPlay}
          className="rounded-full flex-1 h-8 text-xs gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700"
        >
          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
          Mulai
        </Button>
      </div>
    </div>
  );
}

interface RangeStepperProps {
  label: string;
  value: number;
  /** Nama latin surah — tampil di bawah angka */
  namaLatin?: string;
  onChange: (n: number) => void;
}

function RangeStepper({ label, value, namaLatin, onChange }: RangeStepperProps) {
  const decrement = () => onChange(Math.max(1, value - 1));
  const increment = () => onChange(Math.min(114, value + 1));

  return (
    <div className="rounded-xl border border-border/60 bg-card p-2">
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 text-center">
        {label}
      </p>
      <div className="flex items-center justify-between gap-1">
        <button
          onClick={decrement}
          disabled={value <= 1}
          className="w-7 h-7 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-muted-foreground shrink-0"
          aria-label={`Kurangi ${label}`}
        >
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <span className="text-base font-bold text-foreground tabular-nums">{value}</span>
        <button
          onClick={increment}
          disabled={value >= 114}
          className="w-7 h-7 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-muted-foreground shrink-0"
          aria-label={`Tambah ${label}`}
        >
          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
      {namaLatin && (
        <p
          className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate text-center mt-1 px-0.5"
          title={namaLatin}
        >
          {namaLatin}
        </p>
      )}
    </div>
  );
}