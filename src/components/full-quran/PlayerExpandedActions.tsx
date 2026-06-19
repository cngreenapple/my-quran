import { BookOpen, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RangePicker } from "./RangePicker";

interface PlayerExpandedActionsProps {
  isSurahListLoading: boolean;
  showRangePicker: boolean;
  fromNomor: number;
  toNomor: number;
  onOpenRangePicker: () => void;
  onCloseRangePicker: () => void;
  onFromChange: (n: number) => void;
  onToChange: (n: number) => void;
  onPlayFull: () => void;
  onPlayRange: () => void;
  surahList: { nomor: number; namaLatin: string; tempatTurun?: string; jumlahAyat?: number }[] | undefined;
}

/**
 * Expanded section di bawah header & controls.
 *
 * Toggle 2 mode:
 * - Trigger buttons: "Full 1-114" atau "Pilih Range"
 * - Range picker: stepper untuk pilih surah awal/akhir
 */
export function PlayerExpandedActions({
  isSurahListLoading,
  showRangePicker,
  fromNomor,
  toNomor,
  onOpenRangePicker,
  onCloseRangePicker,
  onFromChange,
  onToChange,
  onPlayFull,
  onPlayRange,
  surahList,
}: PlayerExpandedActionsProps) {
  return (
    <div className="pt-2 border-t border-emerald-500/20 space-y-2 animate-fade-in">
      {!showRangePicker ? (
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="default"
            size="sm"
            onClick={onPlayFull}
            className="rounded-full h-8 text-xs gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800"
            disabled={isSurahListLoading}
          >
            <ListMusic className="w-3.5 h-3.5" aria-hidden="true" />
            Full 1-114
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRangePicker}
            className="rounded-full h-8 text-xs gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Pilih Range
          </Button>
        </div>
      ) : (
        <RangePicker
          fromNomor={fromNomor}
          toNomor={toNomor}
          onFromChange={onFromChange}
          onToChange={onToChange}
          onPlay={onPlayRange}
          onCancel={onCloseRangePicker}
          surahList={surahList}
        />
      )}
    </div>
  );
}