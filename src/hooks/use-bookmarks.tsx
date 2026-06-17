import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
    return stored ? (JSON.parse(stored) as BookmarkItem[]) : [];
  } catch {
    return [];
  }
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(loadBookmarks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (surahNumber: number, ayatNumber: number) =>
      bookmarks.some(
        (b) => b.surahNumber === surahNumber && b.ayatNumber === ayatNumber,
      ),
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (item: Omit<BookmarkItem, "id" | "timestamp">) => {
      setBookmarks((prev) => {
        const exists = prev.some(
          (b) =>
            b.surahNumber === item.surahNumber &&
            b.ayatNumber === item.ayatNumber,
        );
        if (exists) {
          return prev.filter(
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
        return [newItem, ...prev];
      });
    },
    [],
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        clearBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx)
    throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
}