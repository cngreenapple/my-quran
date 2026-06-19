import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { Surah } from "@/types/quran";

export type RepeatMode = "off" | "queue" | "single";

interface AudioQueueState {
  queue: number[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: RepeatMode;
}

interface UseAudioQueueOptions {
  surahList: Surah[] | undefined;
  onPlaySurah: (surahNumber: number, surahName: string) => void;
  onStop: () => void;
}

interface UseAudioQueueReturn {
  queue: number[];
  currentIndex: number;
  currentSurah: number | null;
  totalInQueue: number;
  remaining: number;
  isActive: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  progressPercent: number;

  playSingle: (surahNumber: number, surahName: string) => void;
  playRange: (fromNomor: number, toNomor: number) => void;
  playAll: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  jumpTo: (queueIndex: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;

  /**
   * Dipanggil dari audio context saat surah selesai.
   * Return `true` kalau queue sudah handle (suppress default auto-next).
   * Return `false` kalau queue tidak handle — caller bisa pakai default behavior.
   */
  onSurahEnded: (surahNumber: number) => boolean;
}

export function useAudioQueue({
  surahList,
  onPlaySurah,
  onStop,
}: UseAudioQueueOptions): UseAudioQueueReturn {
  const [state, setState] = useState<AudioQueueState>({
    queue: [],
    currentIndex: 0,
    isShuffled: false,
    repeatMode: "off",
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const onPlaySurahRef = useRef(onPlaySurah);
  const onStopRef = useRef(onStop);
  useEffect(() => {
    onPlaySurahRef.current = onPlaySurah;
    onStopRef.current = onStop;
  }, [onPlaySurah, onStop]);

  const surahListRef = useRef(surahList);
  useEffect(() => {
    surahListRef.current = surahList;
  }, [surahList]);

  const getSurahName = useCallback((nomor: number): string => {
    const s = surahListRef.current?.find((x) => x.nomor === nomor);
    return s?.namaLatin || `Surah ${nomor}`;
  }, []);

  const playSingle = useCallback(
    (surahNumber: number, _surahName: string) => {
      setState((prev) => ({
        ...prev,
        queue: [surahNumber],
        currentIndex: 0,
      }));
      onPlaySurahRef.current(surahNumber, getSurahName(surahNumber));
    },
    [getSurahName],
  );

  const playRange = useCallback(
    (fromNomor: number, toNomor: number) => {
      const from = Math.max(1, Math.min(114, fromNomor));
      const to = Math.max(1, Math.min(114, toNomor));
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      const queue: number[] = [];
      for (let i = lo; i <= hi; i++) queue.push(i);
      setState((prev) => ({ ...prev, queue, currentIndex: 0 }));
      onPlaySurahRef.current(queue[0], getSurahName(queue[0]));
    },
    [getSurahName],
  );

  const playAll = useCallback(() => {
    const queue: number[] = [];
    for (let i = 1; i <= 114; i++) queue.push(i);
    setState((prev) => ({ ...prev, queue, currentIndex: 0 }));
    onPlaySurahRef.current(queue[0], getSurahName(queue[0]));
  }, [getSurahName]);

  const stop = useCallback(() => {
    setState((prev) => ({ ...prev, queue: [], currentIndex: 0 }));
    onStopRef.current();
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0) return prev;
      const nextIdx = prev.currentIndex + 1;
      if (nextIdx >= prev.queue.length) {
        if (prev.repeatMode === "queue") {
          onPlaySurahRef.current(prev.queue[0], getSurahName(prev.queue[0]));
          return { ...prev, currentIndex: 0 };
        }
        onStopRef.current();
        return prev;
      }
      onPlaySurahRef.current(prev.queue[nextIdx], getSurahName(prev.queue[nextIdx]));
      return { ...prev, currentIndex: nextIdx };
    });
  }, [getSurahName]);

  const prev = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0) return prev;
      const prevIdx = Math.max(0, prev.currentIndex - 1);
      onPlaySurahRef.current(prev.queue[prevIdx], getSurahName(prev.queue[prevIdx]));
      return { ...prev, currentIndex: prevIdx };
    });
  }, [getSurahName]);

  const jumpTo = useCallback(
    (queueIndex: number) => {
      setState((prev) => {
        if (queueIndex < 0 || queueIndex >= prev.queue.length) return prev;
        onPlaySurahRef.current(prev.queue[queueIndex], getSurahName(prev.queue[queueIndex]));
        return { ...prev, currentIndex: queueIndex };
      });
    },
    [getSurahName],
  );

  const toggleShuffle = useCallback(() => {
    setState((prev) => {
      if (prev.isShuffled) {
        return { ...prev, isShuffled: false, queue: [...prev.queue].sort((a, b) => a - b) };
      }
      const shuffled = [...prev.queue];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { ...prev, isShuffled: true, queue: shuffled, currentIndex: 0 };
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setState((prev) => {
      const order: RepeatMode[] = ["off", "queue", "single"];
      const i = order.indexOf(prev.repeatMode);
      const next = order[(i + 1) % order.length];
      return { ...prev, repeatMode: next };
    });
  }, []);

  /**
   * Handle saat surah selesai diputar.
   *
   * Return true → caller harus suppress default auto-next (sudah di-handle).
   * Return false → caller boleh pakai default behavior.
   *
   * Logic:
   * 1. Kalau queue kosong → return false (default behavior: auto-next ke nomor+1)
   * 2. Kalau surah ada di queue:
   *    - repeatMode "single": replay surah yang sama (handled)
   *    - masih ada next: play next (handled)
   *    - akhir queue + repeatMode "queue": loop (handled)
   *    - akhir queue + repeatMode "off": stop (handled)
   */
  const onSurahEnded = useCallback(
    (surahNumber: number): boolean => {
      const s = stateRef.current;

      // Queue kosong → default auto-next (supaya fitur "play 1 surah" lama tidak rusak)
      if (s.queue.length === 0) {
        return false;
      }

      const idx = s.queue.indexOf(surahNumber);
      if (idx === -1) {
        // Surah ended bukan dari queue (mis. user play dari VerseCard),
        // tapi queue masih aktif. Pakai default behavior: auto-next ke nomor+1
        return false;
      }

      // Queue handle sendiri — suppress default
      if (s.repeatMode === "single") {
        onPlaySurahRef.current(surahNumber, getSurahName(surahNumber));
        return true;
      }

      const nextIdx = idx + 1;
      if (nextIdx < s.queue.length) {
        setState((prev) => ({ ...prev, currentIndex: nextIdx }));
        onPlaySurahRef.current(s.queue[nextIdx], getSurahName(s.queue[nextIdx]));
        return true;
      }

      if (s.repeatMode === "queue") {
        setState((prev) => ({ ...prev, currentIndex: 0 }));
        onPlaySurahRef.current(s.queue[0], getSurahName(s.queue[0]));
        return true;
      }

      // Akhir queue + repeat off → stop
      setState((prev) => ({ ...prev, queue: [], currentIndex: 0 }));
      onStopRef.current();
      return true;
    },
    [getSurahName],
  );

  const currentSurah = state.queue[state.currentIndex] ?? null;
  const totalInQueue = state.queue.length;
  const remaining = state.queue.length > 0 ? state.queue.length - state.currentIndex : 0;
  const isActive = state.queue.length > 0;

  const progressPercent = useMemo(() => {
    if (state.queue.length === 0) return 0;
    return Math.round(((state.currentIndex + 1) / state.queue.length) * 100);
  }, [state.queue.length, state.currentIndex]);

  return {
    queue: state.queue,
    currentIndex: state.currentIndex,
    currentSurah,
    totalInQueue,
    remaining,
    isActive,
    isShuffled: state.isShuffled,
    repeatMode: state.repeatMode,
    progressPercent,
    playSingle,
    playRange,
    playAll,
    stop,
    next,
    prev,
    jumpTo,
    toggleShuffle,
    cycleRepeat,
    onSurahEnded,
  };
}