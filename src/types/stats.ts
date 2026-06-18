export interface ReadingStats {
  totalAyatRead: number;
  surahsOpened: number[];
  lastReadAt: number;
  streakDays: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface ReadingHistoryItem {
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  timestamp: number;
  type: "viewed" | "bookmarked" | "completed";
}

export interface AppSettings {
  showVerseOfTheDay: boolean;
  showTransliteration: boolean;
  autoPlayAudio: boolean;
}