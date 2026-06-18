import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DzikirCounter } from "@/types/dzikir";
import { isSameDay } from "@/lib/date";

const STORAGE_KEY = "quran-dzikir-counters";

interface DzikirContextValue {
  counters: Record<string, DzikirCounter>;
  increment: (categoryId: string, itemId: string, target: number) => void;
  reset: (categoryId: string, itemId: string, target: number) => void;
  resetCategory: (categoryId: string) => void;
  resetAll: () => void;
  getCounter: (categoryId: string, itemId: string, target: number) => DzikirCounter;
  totalCompletedToday: number;
}

const DzikirContext = createContext<DzikirContextValue | null>(null);

function loadCounters(): Record<string, DzikirCounter> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, DzikirCounter>;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

function makeKey(categoryId: string, itemId: string): string {
  return `${categoryId}::${itemId}`;
}

export function DzikirProvider({ children }: { children: ReactNode }) {
  const [counters, setCounters] = useState<Record<string, DzikirCounter>>(loadCounters);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(counters)); }
    catch (err) { console.error("[Dzikir] Failed to save counters", err); }
  }, [counters]);

  const getCounter = useCallback(
    (categoryId: string, itemId: string, target: number): DzikirCounter => {
      const key = makeKey(categoryId, itemId);
      const existing = counters[key];
      if (existing && existing.target === target) return existing;
      return { itemId, categoryId, current: 0, target, lastUpdated: Date.now(), completed: false, totalCompleted: 0 };
    },
    [counters],
  );

  const increment = useCallback((categoryId: string, itemId: string, target: number) => {
    setCounters((prev) => {
      const key = makeKey(categoryId, itemId);
      const existing = prev[key];
      const current = existing ? Math.min(existing.current + 1, target) : 1;
      const completed = current >= target;
      const totalCompleted = existing ? existing.totalCompleted + (completed && !existing.completed ? 1 : 0) : 0;
      return { ...prev, [key]: { itemId, categoryId, current, target, lastUpdated: Date.now(), completed, totalCompleted } };
    });
  }, []);

  const reset = useCallback((categoryId: string, itemId: string, target: number) => {
    setCounters((prev) => {
      const key = makeKey(categoryId, itemId);
      const existing = prev[key];
      return { ...prev, [key]: { itemId, categoryId, current: 0, target, lastUpdated: Date.now(), completed: false, totalCompleted: existing?.totalCompleted ?? 0 } };
    });
  }, []);

  const resetCategory = useCallback((categoryId: string) => {
    setCounters((prev) => {
      const next: Record<string, DzikirCounter> = {};
      for (const [key, value] of Object.entries(prev)) {
        if (value.categoryId !== categoryId) next[key] = value;
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => setCounters({}), []);

  const totalCompletedToday = useMemo(() => {
    const now = Date.now();
    return Object.values(counters).filter((c) => c.completed && isSameDay(c.lastUpdated, now)).length;
  }, [counters]);

  const value = useMemo<DzikirContextValue>(
    () => ({ counters, increment, reset, resetCategory, resetAll, getCounter, totalCompletedToday }),
    [counters, increment, reset, resetCategory, resetAll, getCounter, totalCompletedToday],
  );

  return <DzikirContext.Provider value={value}>{children}</DzikirContext.Provider>;
}

export function useDzikirCounter() {
  const ctx = useContext(DzikirContext);
  if (!ctx) throw new Error("useDzikirCounter must be used within DzikirProvider");
  return ctx;
}