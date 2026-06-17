import { useCallback, useEffect, useState } from "react";
import type { LastRead } from "@/types/quran";

const STORAGE_KEY = "quran-last-read";

function loadLastRead(): LastRead | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as LastRead) : null;
  } catch {
    return null;
  }
}

export function useLastRead() {
  const [lastRead, setLastRead] = useState<LastRead | null>(loadLastRead);

  useEffect(() => {
    if (lastRead) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lastRead));
    }
  }, [lastRead]);

  const updateLastRead = useCallback(
    (data: Omit<LastRead, "timestamp">) => {
      setLastRead({ ...data, timestamp: Date.now() });
    },
    [],
  );

  const clearLastRead = useCallback(() => {
    setLastRead(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { lastRead, updateLastRead, clearLastRead };
}