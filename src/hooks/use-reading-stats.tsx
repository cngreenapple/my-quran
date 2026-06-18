import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ReadingStats, ReadingHistoryItem } from "@/types/stats";

const STATS_KEY = "quran-reading-stats";
const HISTORY_KEY = "quran-reading-history";
const MAX_HISTORY = 100;

interface ReadingStatsContextValue {
  stats: ReadingStats;
  history: ReadingHistoryItem[];
  trackSurahOpen: (surahNumber: number, surahName: string) => void;
  trackAyatRead: (surahNumber: number, surahName: string, ayatNumber: number) => void;
  getProgress: (surahNumber: number, totalAyat: number) => number; // 0-100
  resetStats: () => void;
  getTodayCount: () => number;
}

const DEFAULT_STATS: ReadingStats = {
  totalAyatRead: 0,
  surahsOpened: [],
  lastReadAt: 0,
  streakDays: 0,
  longestStreak: 0,
  lastActivityDate: "",
};

const ReadingStatsContext = createContext<ReadingStatsContextValue | null>(null);

function loadStats(): ReadingStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) return DEFAULT_STATS;
    const parsed = JSON.parse(stored) as ReadingStats;
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return DEFAULT_STATS;
  }
}

function loadHistory(): ReadingHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as ReadingHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function ReadingStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<ReadingStats>(loadStats);
  const [history, setHistory] = useState<ReadingHistoryItem[]>(loadHistory);

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (err) {
      console.error("[Stats] Failed to save", err);
    }
  }, [stats]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.error("[History] Failed to save", err);
    }
  }, [history]);

  /**
   * Update streak based on activity date.
   *
   * FIX: Sekarang `lastReadAt` SELALU update ke Date.now() setiap kali
   * ada activity. Sebelumnya lastReadAt hanya update kalau berbeda hari,
   * sehingga di hari yang sama `lastReadAt` jadi stale.
   *
   * Logic streak:
   * - Hari yang sama: streakDays tidak berubah
   * - Hari berbeda (diff=1): streakDays +1
   * - Hari berbeda (diff>1): streakDays reset ke 1
   * - Belum pernah aktivitas: streakDays = 1 (first activity)
   */
  const updateStreak = useCallback((currentStats: ReadingStats): ReadingStats => {
    const today = getDateKey();
    const now = Date.now();

    let newStreak = currentStats.streakDays;
    if (currentStats.lastActivityDate === today) {
      // Same day: keep streak, only update timestamp
    } else if (currentStats.lastActivityDate) {
      // Different day: check gap
      const diff = daysBetween(currentStats.lastActivityDate, today);
      if (diff === 1) {
        newStreak = currentStats.streakDays + 1;
      } else if (diff > 1) {
        newStreak = 1; // Reset streak
      }
    } else {
      newStreak = 1; // First activity
    }

    return {
      ...currentStats,
      streakDays: newStreak,
      longestStreak: Math.max(currentStats.longestStreak, newStreak),
      lastActivityDate: today,
      lastReadAt: now, // ← FIX: selalu update
    };
  }, []);

  const trackSurahOpen = useCallback(
    (surahNumber: number, surahName: string) => {
      setStats((prev) => {
        // Set lookup O(1) untuk cek membership. Sebelumnya pakai Array.includes() O(n).
        const openedSet = new Set(prev.surahsOpened);
        const isNew = !openedSet.has(surahNumber);
        const surahsOpened = isNew
          ? [...prev.surahsOpened, surahNumber]
          : prev.surahsOpened;

        return updateStreak({ ...prev, surahsOpened });
      });

      // Add to history
      setHistory((prev) => {
        const newItem: ReadingHistoryItem = {
          surahNumber,
          surahName,
          ayatNumber: 0,
          timestamp: Date.now(),
          type: "viewed",
        };
        return [newItem, ...prev].slice(0, MAX_HISTORY);
      });
    },
    [updateStreak],
  );

  const trackAyatRead = useCallback(
    (surahNumber: number, surahName: string, ayatNumber: number) => {
      setStats((prev) => {
        const openedSet = new Set(prev.surahsOpened);
        const isNewSurah = !openedSet.has(surahNumber);
        const surahsOpened = isNewSurah
          ? [...prev.surahsOpened, surahNumber]
          : prev.surahsOpened;

        return updateStreak({
          ...prev,
          surahsOpened,
          totalAyatRead: prev.totalAyatRead + 1,
        });
      });

      // Add to history (replace if same surah/ayat exists within 5 min)
      setHistory((prev) => {
        const filtered = prev.filter(
          (h) =>
            !(
              h.surahNumber === surahNumber &&
              h.ayatNumber === ayatNumber &&
              Date.now() - h.timestamp < 5 * 60 * 1000
            ),
        );
        const newItem: ReadingHistoryItem = {
          surahNumber,
          surahName,
          ayatNumber,
          timestamp: Date.now(),
          type: "viewed",
        };
        return [newItem, ...filtered].slice(0, MAX_HISTORY);
      });
    },
    [updateStreak],
  );

  const getProgress = useCallback(
    (surahNumber: number, _totalAyat: number): number => {
      // Simple heuristic: if surah is opened, return 50% (placeholder)
      // Real progress tracking would need more granular data
      if (stats.surahsOpened.includes(surahNumber)) {
        return 50; // Mark as visited
      }
      return 0;
    },
    [stats.surahsOpened],
  );

  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
    setHistory([]);
  }, []);

  const getTodayCount = useCallback((): number => {
    const today = getDateKey();
    return history.filter((h) => {
      const itemDate = getDateKey(new Date(h.timestamp));
      return itemDate === today && h.ayatNumber > 0;
    }).length;
  }, [history]);

  const value = useMemo<ReadingStatsContextValue>(
    () => ({
      stats,
      history,
      trackSurahOpen,
      trackAyatRead,
      getProgress,
      resetStats,
      getTodayCount,
    }),
    [stats, history, trackSurahOpen, trackAyatRead, getProgress, resetStats, getTodayCount],
  );

  return (
    <ReadingStatsContext.Provider value={value}>
      {children}
    </ReadingStatsContext.Provider>
  );
}

export function useReadingStats() {
  const ctx = useContext(ReadingStatsContext);
  if (!ctx) throw new Error("useReadingStats must be used within ReadingStatsProvider");
  return ctx;
}