export interface ReadingStats {
  totalAyatRead: number; // Total ayat yang pernah dibuka
  surahsOpened: number[]; // Array of surah numbers yang pernah dibuka
  lastReadAt: number; // timestamp
  streakDays: number; // hari berturut membaca
  longestStreak: number;
  lastActivityDate: string; // YYYY-MM-DD
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