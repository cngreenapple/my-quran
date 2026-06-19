interface PlayerProgressProps {
  /** 0-100 */
  percent: number;
  /** Sisa surah dari posisi sekarang sampai akhir queue */
  remaining: number;
}

export function PlayerProgress({ percent, remaining }: PlayerProgressProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
          {percent}%
        </span>
        <span className="text-muted-foreground tabular-nums">
          {remaining} surah tersisa
        </span>
      </div>
      <div
        className="h-1 bg-emerald-500/20 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress baca full: ${percent} persen`}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}