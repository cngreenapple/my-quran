import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TasbihPreset = {
  id: string;
  name: string;
  arabic?: string;
  target: number;
  description: string;
  color: "emerald" | "amber" | "sky" | "rose" | "violet";
};

export const TASBIH_PRESETS: TasbihPreset[] = [
  {
    id: "subhanallah",
    name: "Subhanallah",
    arabic: "سُبْحَانَ ٱللَّٰهِ",
    target: 33,
    description: "Maha Suci Allah",
    color: "emerald",
  },
  {
    id: "alhamdulillah",
    name: "Alhamdulillah",
    arabic: "ٱلْحَمْدُ لِلَّٰهِ",
    target: 33,
    description: "Segala puji bagi Allah",
    color: "emerald",
  },
  {
    id: "allahuakbar",
    name: "Allahu Akbar",
    arabic: "ٱللَّهُ أَكْبَرُ",
    target: 34,
    description: "Allah Maha Besar",
    color: "emerald",
  },
  {
    id: "astaghfirullah",
    name: "Astaghfirullah",
    arabic: "أَسْتَغْفِرُ ٱللَّٰهَ",
    target: 100,
    description: "Aku memohon ampunan Allah",
    color: "amber",
  },
  {
    id: "sholawat",
    name: "Sholawat",
    arabic: "ٱللَّٰهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    target: 100,
    description: "Shalawat kepada Nabi Muhammad ﷺ",
    color: "violet",
  },
  {
    id: "la-ilaha",
    name: "La ilaha illallah",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ",
    target: 100,
    description: "Tiada tuhan selain Allah",
    color: "sky",
  },
  {
    id: "tasbih-tahlil",
    name: "Tasbih Tahlil",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    target: 1000,
    description: "Tahlil lengkap (1000x untuk khataman)",
    color: "rose",
  },
];

export type TasbihState = {
  presetId: string;
  current: number;
  target: number;
  /** YYYY-MM-DD — untuk auto-reset harian */
  dateKey: string;
  /** Total completed cycles sepanjang masa */
  totalCycles: number;
};

const STORAGE_KEY = "quran-tasbih-state";

function loadStates(): Record<string, TasbihState> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, TasbihState>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface TasbihContextValue {
  /** Map presetId → current state */
  states: Record<string, TasbihState>;
  /** Get current state untuk preset, atau reset ke 0 kalau beda hari */
  getState: (preset: TasbihPreset) => TasbihState;
  /**
   * Increment counter preset by 1.
   * Returns `true` kalau baru saja reach target (just-completed event).
   * Caller pakai ini untuk trigger celebration haptic.
   */
  increment: (preset: TasbihPreset) => boolean;
  /** Reset counter preset ke 0 */
  reset: (preset: TasbihPreset) => void;
  /** Reset semua counters */
  resetAll: () => void;
  /** Get total completed cycles hari ini */
  totalCyclesToday: number;
}

const TasbihContext = createContext<TasbihContextValue | null>(null);

export function TasbihProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<string, TasbihState>>(loadStates);

  // Persist ke localStorage setiap perubahan
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    } catch (err) {
      console.error("[Tasbih] Failed to save", err);
    }
  }, [states]);

  const getState = useCallback(
    (preset: TasbihPreset): TasbihState => {
      const today = getTodayKey();
      const existing = states[preset.id];
      if (existing && existing.dateKey !== today) {
        return {
          presetId: preset.id,
          current: 0,
          target: preset.target,
          dateKey: today,
          totalCycles: existing.totalCycles,
        };
      }
      if (existing) return existing;
      return {
        presetId: preset.id,
        current: 0,
        target: preset.target,
        dateKey: today,
        totalCycles: 0,
      };
    },
    [states],
  );

  const increment = useCallback((preset: TasbihPreset): boolean => {
    let justCompleted = false;
    setStates((prev) => {
      const today = getTodayKey();
      const existing = prev[preset.id];
      const wasComplete = existing ? existing.current >= preset.target : false;
      const baseCurrent = existing && existing.dateKey === today ? existing.current : 0;
      const next = baseCurrent + 1;
      // Detect transition: was NOT complete, NOW reaching target
      justCompleted = !wasComplete && next >= preset.target;
      return {
        ...prev,
        [preset.id]: {
          presetId: preset.id,
          current: next,
          target: preset.target,
          dateKey: today,
          totalCycles: (existing?.totalCycles ?? 0) + (justCompleted ? 1 : 0),
        },
      };
    });
    return justCompleted;
  }, []);

  const reset = useCallback((preset: TasbihPreset) => {
    setStates((prev) => {
      const today = getTodayKey();
      const existing = prev[preset.id];
      return {
        ...prev,
        [preset.id]: {
          presetId: preset.id,
          current: 0,
          target: preset.target,
          dateKey: today,
          totalCycles: existing?.totalCycles ?? 0,
        },
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setStates({});
  }, []);

  const totalCyclesToday = useMemo(() => {
    const today = getTodayKey();
    return Object.values(states)
      .filter((s) => s.dateKey === today && s.current >= s.target)
      .length;
  }, [states]);

  const value = useMemo<TasbihContextValue>(
    () => ({ states, getState, increment, reset, resetAll, totalCyclesToday }),
    [states, getState, increment, reset, resetAll, totalCyclesToday],
  );

  return <TasbihContext.Provider value={value}>{children}</TasbihContext.Provider>;
}

export function useTasbihCounter() {
  const ctx = useContext(TasbihContext);
  if (!ctx) throw new Error("useTasbihCounter must be used within TasbihProvider");
  return ctx;
}