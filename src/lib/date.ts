/**
 * Date utilities + Hijri calendar conversion
 *
 * Hijri conversion: Tabular Islamic Calendar (Kuwaiti/civil variant)
 * - Bukan astronomical observation (yang dipakai Saudi)
 * - Konsisten & deterministik (input sama → output sama)
 * - Selisih ±1-2 hari dari observasi Saudi (tergantung lokasi)
 * - Cocok untuk display. Untuk menentukan awal Ramadan, tetap pakai
 *   keputusan resmi Kemenag.
 */

const HIJRI_MONTH_NAMES = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

const HIJRI_MONTH_NAMES_ARABIC = [
  "مُحَرَّم", "صَفَر", "رَبِيعُ ٱلْأَوَّل", "رَبِيعُ ٱلثَّانِي",
  "جُمَادَى ٱلْأُولَى", "جُمَادَى ٱلثَّانِيَة", "رَجَب", "شَعْبَان",
  "رَمَضَان", "شَوَّال", "ذُو ٱلْقَعْدَة", "ذُو ٱلْحِجَّة",
];

const GREGORIAN_MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const GREGORIAN_MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const INDONESIAN_WEEKDAYS = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];

const INDONESIAN_WEEKDAYS_SHORT = [
  "Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab",
];

export {
  HIJRI_MONTH_NAMES,
  HIJRI_MONTH_NAMES_ARABIC,
  GREGORIAN_MONTH_NAMES,
  GREGORIAN_MONTH_NAMES_SHORT,
  INDONESIAN_WEEKDAYS,
  INDONESIAN_WEEKDAYS_SHORT,
};

export function getDateKey(date: Date | number = new Date()): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function isSameDay(t1: number | Date, t2: number | Date): boolean {
  return getDateKey(t1) === getDateKey(t2);
}

export function isHijriLeapYear(year: number): boolean {
  const r = year % 30;
  return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(r);
}

export function getHijriMonthLengths(year: number): number[] {
  return isHijriLeapYear(year)
    ? [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30]
    : [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
}

export function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function hijriYearToJDN(year: number): number {
  return 1948440 + Math.floor((10631 * year - 10646) / 30);
}

export function jdnToHijri(jdn: number): { year: number; month: number; day: number } {
  if (jdn < 1948440) return { year: 1, month: 1, day: 1 };
  const daysSinceEpoch = jdn - 1948440;
  let year = Math.floor((30 * daysSinceEpoch + 10646) / 10631);
  while (jdn >= hijriYearToJDN(year + 1)) year++;
  while (jdn < hijriYearToJDN(year)) year--;
  const dayOfYear = jdn - hijriYearToJDN(year) + 1;
  const monthLengths = getHijriMonthLengths(year);
  let month = 1;
  let remaining = dayOfYear;
  for (let i = 0; i < 12; i++) {
    if (remaining <= monthLengths[i]) {
      month = i + 1;
      break;
    }
    remaining -= monthLengths[i];
  }
  return { year, month, day: remaining };
}

export interface HijriInfo {
  year: number;
  month: number;
  monthName: string;
  monthArabic: string;
  day: number;
}

export interface TodayInfo {
  gregorian: {
    date: Date;
    dateKey: string;
    weekday: string;
    weekdayShort: string;
    day: number;
    month: number;
    monthName: string;
    monthNameShort: string;
    year: number;
  };
  hijri: HijriInfo;
}

export function getTodayInfo(date: Date = new Date()): TodayInfo {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const hijriDate = jdnToHijri(jdn);
  return {
    gregorian: {
      date,
      dateKey: getDateKey(date),
      weekday: INDONESIAN_WEEKDAYS[date.getDay()],
      weekdayShort: INDONESIAN_WEEKDAYS_SHORT[date.getDay()],
      day: date.getDate(),
      month: date.getMonth() + 1,
      monthName: GREGORIAN_MONTH_NAMES[date.getMonth()],
      monthNameShort: GREGORIAN_MONTH_NAMES_SHORT[date.getMonth()],
      year: date.getFullYear(),
    },
    hijri: {
      year: hijriDate.year,
      month: hijriDate.month,
      monthName: HIJRI_MONTH_NAMES[hijriDate.month - 1],
      monthArabic: HIJRI_MONTH_NAMES_ARABIC[hijriDate.month - 1],
      day: hijriDate.day,
    },
  };
}

export function formatFullDate(date: Date = new Date()): string {
  const info = getTodayInfo(date);
  return `${info.gregorian.weekday}, ${info.gregorian.day} ${info.gregorian.monthName} ${info.gregorian.year}`;
}

export function formatShortDate(date: Date = new Date()): string {
  return `${date.getDate()} ${GREGORIAN_MONTH_NAMES_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatTime(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}