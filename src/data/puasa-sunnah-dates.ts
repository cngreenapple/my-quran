import type { FastingItem } from "@/data/puasa-sunnah";
import { PUASA_SUNNAH } from "@/data/puasa-sunnah";

/**
 * Mapping tanggal Hijriah → puasa sunnah
 * untuk ditampilkan di kalender
 */
export interface PuasaSunnahDate {
  hijriDay: number;
  hijriMonth: number; // 1-12
  puasaId: string; // ID dari PUASA_SUNNAH
  note?: string; // catatan tambahan
}

export const PUASA_SUNNAH_DATES: PuasaSunnahDate[] = [
  // Asyura (10 Muharram) & Tasu'a (9 Muharram)
  // NOTE: Ayyamul Bidh (13, 14, 15) untuk SEMUA bulan di-handle otomatis
  // oleh getPuasaSunnahForDate(), jadi tidak perlu di-hardcode di sini.
  { hijriDay: 9, hijriMonth: 1, puasaId: "tasua", note: "Dianjurkan berpuasa Tasu'a bersama Asyura" },
  { hijriDay: 10, hijriMonth: 1, puasaId: "asyura" },

  // 9 Hari pertama Dzulhijjah + Hari Arafah
  { hijriDay: 1, hijriMonth: 12, puasaId: "dzulhijjah-awal" },
  { hijriDay: 2, hijriMonth: 12, puasaId: "dzulhijjah-awal" },
  { hijriDay: 3, hijriMonth: 12, puasaId: "dzulhijjah-awal" },
  { hijriDay: 4, hijriMonth: 12, puasaId: "dzulhijjah-awal" },
  { hijriDay: 5, hijriMonth: 12, puasaId: "dzulhijjah-awal" },
  { hijriDay: 6, hijriMonth: 12, puasaId: "dzulhijjah-awal" },
  { hijriDay: 7, hijriMonth: 12, puasaId: "dzulhijjah-awal" },
  { hijriDay: 8, hijriMonth: 12, puasaId: "dzulhijjah-awal" },
  { hijriDay: 9, hijriMonth: 12, puasaId: "arafah", note: "Hari Arafah - puncak ibadah haji" },

  // 6 hari Syawal (2-6 Syawal; 1 Syawal adalah Idul Fitri)
  { hijriDay: 2, hijriMonth: 10, puasaId: "syawal" },
  { hijriDay: 3, hijriMonth: 10, puasaId: "syawal" },
  { hijriDay: 4, hijriMonth: 10, puasaId: "syawal" },
  { hijriDay: 5, hijriMonth: 10, puasaId: "syawal" },
  { hijriDay: 6, hijriMonth: 10, puasaId: "syawal" },
];

/**
 * Cek apakah tanggal Hijriah tertentu adalah tanggal puasa sunnah
 * Senin & Kamis dideteksi otomatis via weekday
 */
export function getPuasaSunnahForDate(
  hijriDay: number,
  hijriMonth: number,
  weekday?: number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
): { puasa: FastingItem; note?: string; isRecurring: boolean }[] {
  const results: { puasa: FastingItem; note?: string; isRecurring: boolean }[] = [];

  // Hardcoded dates (fixed Hijri dates)
  const matches = PUASA_SUNNAH_DATES.filter(
    (p) => p.hijriDay === hijriDay && p.hijriMonth === hijriMonth,
  );
  for (const m of matches) {
    const puasa = PUASA_SUNNAH.find((p) => p.id === m.puasaId);
    if (puasa) {
      results.push({ puasa, note: m.note, isRecurring: false });
    }
  }

  // Ayyamul Bidh (13, 14, 15) untuk SEMUA bulan — auto-detect
  if (hijriDay >= 13 && hijriDay <= 15) {
    const ayyamulBidh = PUASA_SUNNAH.find((p) => p.id === "ayyamul-bidh");
    if (ayyamulBidh && !results.some((r) => r.puasa.id === "ayyamul-bidh")) {
      results.push({
        puasa: ayyamulBidh,
        isRecurring: true,
        note: "Puasa Ayyamul Bidh",
      });
    }
  }

  // Senin & Kamis (weekday 1 = Monday, 4 = Thursday) — auto-detect
  if (weekday === 1 || weekday === 4) {
    const seninKamis = PUASA_SUNNAH.find((p) => p.id === "senin-kamis");
    if (seninKamis && !results.some((r) => r.puasa.id === "senin-kamis")) {
      results.push({
        puasa: seninKamis,
        isRecurring: true,
        note: weekday === 1 ? "Puasa Senin" : "Puasa Kamis",
      });
    }
  }

  return results;
}