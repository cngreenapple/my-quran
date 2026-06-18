import type { IslamicHoliday } from "@/data/islamic-holidays";

/**
 * Color token map per IslamicHoliday.color.
 * Single source of truth — di-import di DayCell, Legend, HolidaysTable.
 * Memudahkan perubahan tema di satu tempat.
 */
export const colorClasses: Record<
  IslamicHoliday["color"],
  {
    bg: string;
    text: string;
    ring: string;
    emojiBg: string;
    dot: string;
  }
> = {
  emerald: {
    bg: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/40",
    emojiBg: "bg-emerald-500/15",
    dot: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/40",
    emojiBg: "bg-amber-500/15",
    dot: "bg-amber-500",
  },
  rose: {
    bg: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/40",
    emojiBg: "bg-rose-500/15",
    dot: "bg-rose-500",
  },
  sky: {
    bg: "bg-sky-500",
    text: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/40",
    emojiBg: "bg-sky-500/15",
    dot: "bg-sky-500",
  },
  violet: {
    bg: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/40",
    emojiBg: "bg-violet-500/15",
    dot: "bg-violet-500",
  },
};

/**
 * Hijriah month name in Bahasa Indonesia (1-12)
 * Reference: Keputusan MUI, dipakai resmi di kalender Kemenag RI
 */
export const HIJRI_MONTH_NAMES_ID: Record<number, string> = {
  1: "Muharram",
  2: "Safar",
  3: "Rabi'ul Awal",
  4: "Rabi'ul Akhir",
  5: "Jumadil Awal",
  6: "Jumadil Akhir",
  7: "Rajab",
  8: "Syaban",
  9: "Ramadan",
  10: "Syawal",
  11: "Dzulka'dah",
  12: "Dzulhijjah",
};