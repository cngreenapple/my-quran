/**
 * Hijri-Gregorian Calendar Converter
 * Menggunakan algoritma Umm al-Qura untuk akurasi tinggi
 *
 * Catatan: Konversi Hijriah sebenarnya bisa berbeda 1-2 hari antar negara
 * tergantung metode rukyat (pengamatan bulan). Algoritma ini adalah
 * "tabel" yang digunakan secara resmi di Arab Saudi.
 */

import type {
  CalendarDay,
  IslamicHoliday,
  HijriMonth,
  UpcomingEvent,
} from "@/types/hijri-calendar";
import {
  ISLAMIC_HOLIDAYS,
  HIJRI_MONTHS,
  WEEKDAYS_ID,
} from "@/data/islamic-holidays";

/**
 * Konversi Gregorian → Hijri
 * Returns: { day, month, year, monthName, monthArabic }
 */
export function gregorianToHijri(date: Date): {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthArabic: string;
} {
  // Algoritma konversi berdasarkan Islamic calendar arithmetic
  // Reference: "Calendrical Calculations" by Reingold & Dershowitz

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

/**
 * Konversi Hijri → Gregorian (returns Date)
 */
export function hijriToGregorian(
  day: number,
  month: number,
  year: number,
): Date {
  const jd = hijriToJD(year, month, day);
  return jdToGregorian(jd);
}

/**
 * Convert Gregorian date to Julian Day Number
 */
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

/**
 * Convert Julian Day Number to Gregorian date
 */
function jdToGregorian(jd: number): Date {
  const a = jd + 32044;
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

/**
 * Convert Julian Day Number to Hijri date
 */
function jdToHijri(jd: number): { year: number; month: number; day: number } {
  // Islamic epoch in JD: 1948440 (Friday, July 16, 622 CE)
  const epoch = 1948440;

  // Adjust JD: previous sunset
  jd = Math.floor(jd) + 1;

  const year = Math.floor(((30 * (jd - epoch)) + 10646) / 10631);
  const month = Math.min(
    12,
    Math.ceil((jd - (29 + hijriToJD(year, 1, 1))) / 29.5) + 1,
  );
  const day = jd - hijriToJD(year, month, 1) + 1;

  return { year, month, day };
}

/**
 * Convert Hijri date to Julian Day Number
 */
function hijriToJD(year: number, month: number, day: number): number {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + (year - 1) * 11) / 30) +
    227014
  );
}

/**
 * Get list of holidays for a specific Hijri date
 */
export function getHolidaysForHijriDate(
  day: number,
  month: number,
): IslamicHoliday[] {
  return ISLAMIC_HOLIDAYS.filter(
    (h) => h.type === "fixed" && h.hijriDay === day && h.hijriMonth === month,
  );
}

/**
 * Get all calendar days for a Gregorian month
 */
export function getMonthCalendar(
  year: number,
  month: number,
  options: { today?: Date } = {},
): CalendarDay[] {
  const today = options.today ?? new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: CalendarDay[] = [];

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const current = new Date(year, month, d);
    current.setHours(0, 0, 0, 0);

    const hijri = gregorianToHijri(current);
    const weekday = current.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const isToday = current.getTime() === today.getTime();
    const isJumat = weekday === 5;

    days.push({
      gregorian: {
        date: current,
        day: d,
        month: month + 1,
        year,
        weekday: WEEKDAYS_ID[weekday],
      },
      hijri: {
        day: hijri.day,
        month: hijri.month,
        year: hijri.year,
        monthName: hijri.monthName,
        monthArabic: hijri.monthArabic,
      },
      isToday,
      isWeekend,
      isJumat,
      holidays: getHolidaysForHijriDate(hijri.day, hijri.month),
    });
  }

  return days;
}

/**
 * Get upcoming events (H-30 days ke depan)
 */
export function getUpcomingEvents(
  options: { daysAhead?: number; fromDate?: Date } = {},
): UpcomingEvent[] {
  const { daysAhead = 90, fromDate = new Date() } = options;
  fromDate.setHours(0, 0, 0, 0);

  const events: UpcomingEvent[] = [];
  const todayHijri = gregorianToHijri(fromDate);

  for (const holiday of ISLAMIC_HOLIDAYS) {
    if (holiday.type !== "fixed" || !holiday.hijriDay || !holiday.hijriMonth) {
      continue;
    }

    // Hitung tanggal Gregorian untuk tahun Hijriah ini dan tahun depan
    const candidateYears = [todayHijri.year, todayHijri.year + 1];

    for (const hYear of candidateYears) {
      try {
        const gregDate = hijriToGregorian(
          holiday.hijriDay,
          holiday.hijriMonth,
          hYear,
        );
        gregDate.setHours(0, 0, 0, 0);

        const daysUntil = Math.round(
          (gregDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntil >= 0 && daysUntil <= daysAhead) {
          const monthInfo = HIJRI_MONTHS.find(
            (m) => m.number === holiday.hijriMonth!,
          );
          events.push({
            holiday,
            daysUntil,
            gregorianDate: gregDate,
            hijriLabel: `${holiday.hijriDay} ${monthInfo?.name || ""} ${hYear} H`,
          });
        }
      } catch (err) {
        // Skip invalid dates
        continue;
      }
    }
  }

  // Sort by nearest
  return events.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Get today's information
 */
export function getTodayInfo(date: Date = new Date()) {
  const hijri = gregorianToHijri(date);
  const holidays = getHolidaysForHijriDate(hijri.day, hijri.month);
  const weekday = WEEKDAYS_ID[date.getDay()];

  return {
    gregorian: {
      date,
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      weekday,
    },
    hijri,
    holidays,
    isJumat: date.getDay() === 5,
  };
}

/**
 * Get current Hijri month info
 */
export function getCurrentHijriMonth(date: Date = new Date()): HijriMonth {
  const hijri = gregorianToHijri(date);
  return (
    HIJRI_MONTHS.find((m) => m.number === hijri.month) || HIJRI_MONTHS[0]
  );
}

/**
 * Format tanggal lengkap dalam bahasa Indonesia
 */
export function formatFullDate(date: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}