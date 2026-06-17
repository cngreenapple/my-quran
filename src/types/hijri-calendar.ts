export interface IslamicHoliday {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  type: "fixed" | "calculated";
  // For fixed: { day, month } in Hijri calendar
  // For calculated: special handling
  hijriDay?: number;
  hijriMonth?: number; // 1-12
  // Display options
  emoji: string;
  color: "emerald" | "amber" | "rose" | "sky" | "violet";
  duration: number; // days, 1 = single day
  greeting?: string; // Indonesian greeting
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
  isJumat: boolean;
}

export type UpcomingEvent = {
  holiday: IslamicHoliday;
  daysUntil: number;
  gregorianDate: Date;
  hijriLabel: string;
};