/**
 * Calendar grid utilities.
 *
 * Helper functions untuk generate grid kalender:
 * - gregorianMonthInfo: info bulan Masehi (days in month, start weekday)
 * - getHijriMonthInfo: info bulan Hijriah (days in month, start weekday)
 *
 * Untuk konversi Masehi ↔ Hijriah dan helper JDN pakai `lib/date.ts`
 * (gregorianToJDN, jdnToHijri, isHijriLeapYear, getHijriMonthLengths).
 */

import { isHijriLeapYear, getHijriMonthLengths } from "@/lib/date";

/**
 * Info bulan Masehi untuk grid kalender.
 * @param year full year (e.g. 2025)
 * @param month 0-indexed (Jan=0, Dec=11) — JS Date convention
 */
export function gregorianMonthInfo(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  return { firstDay, lastDay, daysInMonth, startWeekday };
}

/**
 * Hitung info bulan Hijriah untuk grid kalender.
 * - daysInMonth: 29 atau 30 (tergantung kabisat)
 * - startWeekday: 0-6 (Minggu=0) untuk tanggal 1 bulan Hijriah tsb
 * - startDate / endDate: Date Gregorian in range
 *
 * Algoritma: 1 Muharram tahun Y → JDN = 1948440 + floor((10631*Y - 10646) / 30)
 */
export function getHijriMonthInfo(hijriYear: number, hijriMonth: number) {
  const epochJDN = 1948440;
  const yearStartJDN =
    epochJDN + Math.floor((10631 * hijriYear - 10646) / 30);

  const monthLengths = getHijriMonthLengths(hijriYear);

  // Day-of-year untuk hijriMonth (1-indexed)
  let dayOfYear = 1;
  for (let i = 0; i < hijriMonth - 1; i++) {
    dayOfYear += monthLengths[i];
  }
  const monthStartJDN = yearStartJDN + dayOfYear - 1;
  const monthEndJDN = monthStartJDN + monthLengths[hijriMonth - 1] - 1;

  return {
    daysInMonth: monthLengths[hijriMonth - 1],
    startWeekday: jdnToDate(monthStartJDN).getDay(),
    startDate: jdnToDate(monthStartJDN),
    endDate: jdnToDate(monthEndJDN),
  };
}

/**
 * Convert JDN (Julian Day Number) ke JavaScript Date (Gregorian).
 * Inverse dari gregorianToJDN.
 * Local to this module — tidak di-export untuk hindari duplikasi.
 */
function jdnToDate(jdn: number): Date {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return new Date(year, month - 1, day);
}