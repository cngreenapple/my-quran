/**
 * Calendar grid utilities.
 *
 * Helper functions untuk generate grid kalender:
 * - gregorianMonthInfo: info bulan Masehi (days in month, start weekday)
 * - getHijriMonthInfo: info bulan Hijriah (days in month, start weekday)
 *
 * Untuk konversi Masehi ↔ Hijriah pakai `lib/date.ts` (gregorianToJDN, jdnToHijri).
 */

const HIJRI_LEAP_YEARS_PATTERN = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];

export function isHijriLeapYear(year: number): boolean {
  return HIJRI_LEAP_YEARS_PATTERN.includes(year % 30);
}

export function getHijriMonthLengths(year: number): number[] {
  return isHijriLeapYear(year)
    ? [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30]
    : [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
}

export function gregorianMonthInfo(year: number, month: number) {
  // month: 0-11 (JS Date convention)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  return { firstDay, lastDay, daysInMonth, startWeekday };
}

/**
 * Hitung info bulan Hijriah:
 * - daysInMonth: 29 atau 30 (tergantung kabisat)
 * - startWeekday: 0-6 (hari Minggu = 0) dari tanggal 1 bulan Hijriah tsb
 *
 * Algoritma: epoch Hijriah JDN = 1948440 (1 Muharram 1 H)
 * 1 Muharram tahun Y → JDN = 1948440 + floor((10631*Y - 10646) / 30)
 */
export function getHijriMonthInfo(hijriYear: number, hijriMonth: number) {
  const epochJDN = 1948440;
  const yearStartJDN =
    epochJDN + Math.floor((10631 * hijriYear - 10646) / 30);

  const monthLengths = getHijriMonthLengths(hijriYear);

  // Day-of-year untuk hijriMonth
  let dayOfYear = 1;
  for (let i = 0; i < hijriMonth - 1; i++) {
    dayOfYear += monthLengths[i];
  }
  const monthStartJDN = yearStartJDN + dayOfYear - 1;

  // JDN → Date (Gregorian) untuk dapat weekday
  const monthStart = jdnToDate(monthStartJDN);
  const monthEnd = jdnToDate(monthStartJDN + monthLengths[hijriMonth - 1] - 1);

  return {
    daysInMonth: monthLengths[hijriMonth - 1],
    startWeekday: monthStart.getDay(),
    startDate: monthStart,
    endDate: monthEnd,
  };
}

/**
 * Convert JDN (Julian Day Number) ke JavaScript Date.
 * Inverse dari gregorianToJDN.
 */
export function jdnToDate(jdn: number): Date {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 1461);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return new Date(year, month - 1, day);
}