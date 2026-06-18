/**
 * Date utilities — reusable across hooks dan lib.
 * Pakai local date (bukan UTC) supaya match dengan hari user.
 */

/**
 * Get YYYY-MM-DD date key dari Date/timestamp.
 * Pakai local date components untuk konsistensi dengan user timezone.
 */
export function getDateKey(date: Date | number = new Date()): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Hitung jumlah hari antara 2 date strings (YYYY-MM-DD).
 * Positive = date2 setelah date1, negative = sebaliknya.
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Cek apakah 2 timestamps di hari yang sama (local time).
 */
export function isSameDay(t1: number | Date, t2: number | Date): boolean {
  return getDateKey(t1) === getDateKey(t2);
}

/* ============================================================
 * Hijri helpers (untuk hero card di home page)
 * Pakai Julian Day Number algorithm
 * ============================================================ */

const WEEKDAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const HIJRI_MONTHS: Array<{ number: number; name: string; nameArabic: string }> = [
  { number: 1, name: "Muharram", nameArabic: "المحرم" },
  { number: 2, name: "Safar", nameArabic: "صفر" },
  { number: 3, name: "Rabiul Awal", nameArabic: "ربيع الأول" },
  { number: 4, name: "Rabiul Akhir", nameArabic: "ربيع الثاني" },
  { number: 5, name: "Jumadil Awal", nameArabic: "جمادى الأولى" },
  { number: 6, name: "Jumadil Akhir", nameArabic: "جمادى الثانية" },
  { number: 7, name: "Rajab", nameArabic: "رجب" },
  { number: 8, name: "Sya'ban", nameArabic: "شعبان" },
  { number: 9, name: "Ramadan", nameArabic: "رمضان" },
  { number: 10, name: "Syawal", nameArabic: "شوال" },
  { number: 11, name: "Dzulqa'dah", nameArabic: "ذو القعدة" },
  { number: 12, name: "Dzulhijjah", nameArabic: "ذو الحجة" },
];

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthArabic: string;
}

function gregorianToJD(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

function hijriToJD(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + (year - 1) * 11) / 30) +
    227014
  );
}

function jdToHijri(jd: number): { year: number; month: number; day: number } {
  const epoch = 1948440;
  jd = Math.floor(jd) + 1;
  const year = Math.floor(((30 * (jd - epoch)) + 10646) / 10631);
  const month = Math.min(
    12,
    Math.ceil((jd - (29 + hijriToJD(year, 1, 1))) / 29.5) + 1,
  );
  const day = jd - hijriToJD(year, month, 1) + 1;
  return { year, month, day };
}

export function gregorianToHijri(date: Date): HijriDate {
  const jd = gregorianToJD(date);
  const { year, month, day } = jdToHijri(jd);
  const monthInfo = HIJRI_MONTHS.find((m) => m.number === month) || HIJRI_MONTHS[0];
  return {
    day,
    month,
    year,
    monthName: monthInfo.name,
    monthArabic: monthInfo.nameArabic,
  };
}

export function formatFullDate(date: Date): string {
  return `${WEEKDAYS_ID[date.getDay()]}, ${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

export function getTodayInfo(date: Date = new Date()) {
  return {
    gregorian: {
      date,
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      weekday: WEEKDAYS_ID[date.getDay()],
    },
    hijri: gregorianToHijri(date),
  };
}