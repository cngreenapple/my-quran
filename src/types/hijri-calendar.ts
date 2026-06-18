import type { ColorVariant } from "@/types/quran";

export interface IslamicHoliday {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  type: "fixed";
  hijriDay?: number;
  hijriMonth?: number;
  emoji: string;
  color: ColorVariant;
  duration: number;
  greeting?: string;
}

export interface PuasaSunnahMarker {
  id: string;
  title: string;
  emoji: string;
  color: ColorVariant;
  note?: string;
  isRecurring?: boolean;
}

export interface HijriMonth {
  number: number;
  name: string;
  nameArabic: string;
  meaning: string;
}

export interface CalendarDay {
  gregorian: {
    date: Date;
    day: number;
    month: number;
    year: number;
    weekday: string;
  };
  hijri: {
    day: number;
    month: number;
    year: number;
    monthName: string;
    monthArabic: string;
  };
  isToday: boolean;
  isWeekend: boolean;
  holidays: IslamicHoliday[];
  puasaSunnah: PuasaSunnahMarker[];
  isJumat: boolean;
}

export type UpcomingEvent = {
  holiday: IslamicHoliday;
  daysUntil: number;
  gregorianDate: Date;
  hijriLabel: string;
};