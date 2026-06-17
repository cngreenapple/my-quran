import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BookmarkItem } from "@/types/quran";

const STORAGE_KEY = "quran-bookmarks";

interface BookmarkContextValue {
  bookmarks: BookmarkItem[];
  isBookmarked: (surahNumber: number, ayatNumber: number) => boolean;
  toggleBookmark: (item: Omit<BookmarkItem, "id" | "timestamp">) => void;
  removeBookmark: (id: string) => void;
  clearBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

function loadBookmarks(): BookmarkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as BookmarkItem[]) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("[Bookmark] Failed to load from localStorage", err);
    return [];
  }
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(loadBookmarks);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (err) {
      console.error("[Bookmark] Failed to save to localStorage", err);
    }
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (surahNumber: number, ayatNumber: number) => {
      if (!Array.isArray(bookmarks) || bookmarks.length === 0) return false;
      return bookmarks.some(
        (b) => b.surahNumber === surahNumber && b.ayatNumber === ayatNumber,
      );
    },
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (item: Omit<BookmarkItem, "id" | "timestamp">) => {
      setBookmarks((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const exists = safePrev.some(
          (b) =>
            b.surahNumber === item.surahNumber &&
            b.ayatNumber === item.ayatNumber,
        );
        if (exists) {
          return safePrev.filter(
            (b) =>
              !(
                b.surahNumber === item.surahNumber &&
                b.ayatNumber === item.ayatNumber
              ),
          );
        }
        const newItem: BookmarkItem = {
          ...item,
          id: `${item.surahNumber}-${item.ayatNumber}-${Date.now()}`,
          timestamp: Date.now(),
        };
        return [newItem, ...safePrev];
      });
    },
    [],
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.filter((b) => b.id !== id);
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  const value = useMemo<BookmarkContextValue>(
    () => ({
      bookmarks,
      isBookmarked,
      toggleBookmark,
      removeBookmark,
      clearBookmarks,
    }),
    [bookmarks, isBookmarked, toggleBookmark, removeBookmark, clearBookmarks],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
}