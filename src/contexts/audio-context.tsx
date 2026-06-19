import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSurahList, getAudioSources, appendAudioSources } from "@/lib/api";
import { broadcastStop, subscribeToStop } from "@/lib/audio-coordinator";

interface AudioContextValue {
  currentSurah: number | null;
  currentSurahName: string;
  audioUrl: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  error: string | null;
  isLoadingAudio: boolean;
  play: (surahNumber: number, surahName: string) => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (time: number) => void;
  /**
   * Register callback yang dipanggil saat surah selesai diputar.
   * Return `false` dari callback untuk suppress default auto-next behavior.
   * Berguna untuk queue manager (mis. play range 5-10, skip auto-next ke 11).
   */
  onSurahEnded: (callback: (surahNumber: number) => boolean | void) => () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

function getAudioErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Gagal memutar audio. Silakan coba lagi.";
  }
  if (error.name === "AbortError") {
    return "";
  }
  if (error.name === "NotAllowedError") {
    return "Klik tombol play untuk memulai audio (browser memerlukan interaksi).";
  }
  if (error.name === "NotSupportedError") {
    return "Format audio tidak didukung. Coba surah lain.";
  }
  return error.message || "Gagal memutar audio.";
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTokenRef = useRef(0);
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [currentSurahName, setCurrentSurahName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  /**
   * Set of callbacks yang dipanggil saat surah selesai.
   * Return `false` untuk suppress default behavior (auto-next).
   */
  const onEndedCallbacksRef = useRef<Set<(nomor: number) => boolean | void>>(new Set());

  const { data: surahList } = useQuery({
    queryKey: ["surah-list"],
    queryFn: fetchSurahList,
    staleTime: Infinity,
  });

  const currentSurahRef = useRef<number | null>(currentSurah);
  const surahListRef = useRef(surahList);
  const playRef = useRef<((surahNumber: number, surahName: string) => void) | null>(null);
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

  useEffect(() => {
    surahListRef.current = surahList;
  }, [surahList]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onDurationChange = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onPlay = () => {
      setIsPlaying(true);
      setError(null);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoadingAudio(true);
    const onCanPlay = () => {
      setIsLoadingAudio(false);
      setError(null);
    };
    const onEnded = () => {
      const prev = currentSurahRef.current;

      // Notify subscribers (e.g. queue manager). Kalau ada yang return `false`,
      // suppress default auto-next (queue sudah handle sendiri).
      let suppressDefault = false;
      if (prev !== null) {
        for (const cb of onEndedCallbacksRef.current) {
          try {
            const result = cb(prev);
            if (result === false) suppressDefault = true;
          } catch (err) {
            console.error("[Audio] onSurahEnded callback error", err);
          }
        }
      }

      if (suppressDefault) return;

      // Default behavior: auto-next ke surah berikutnya (114 → stop)
      if (prev && prev < 114) {
        const next = prev + 1;
        const nextSurahInfo = surahListRef.current?.find((s) => s.nomor === next);
        const nextName = nextSurahInfo?.namaLatin || `Surah ${next}`;
        setTimeout(() => playRef.current?.(next, nextName), 0);
      } else {
        setTimeout(() => stopRef.current?.(), 0);
      }
    };
    const onError = () => {
      const mediaError = audio.error;
      console.error("[Audio Error]", {
        code: mediaError?.code,
        message: mediaError?.message,
        src: audio.src,
        surah: currentSurahRef.current,
      });
      setIsLoadingAudio(false);

      let message = "Gagal memuat audio.";
      if (mediaError) {
        switch (mediaError.code) {
          case 1: message = "Pemutaran audio dibatalkan."; break;
          case 2: message = "Gagal memuat audio. Periksa koneksi internet Anda."; break;
          case 3: message = "Format audio tidak dapat diputar oleh browser."; break;
          case 4: message = "Sumber audio tidak ditemukan. Coba lagi dalam beberapa saat."; break;
        }
      }
      setError(message);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeAttribute("src");
      while (audio.firstChild) audio.removeChild(audio.firstChild);
      audio.load();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const audio = audioRef.current;
        if (audio && !audio.paused) audio.pause();
      }
    };
    const handleBeforeUnload = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) audio.pause();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToStop((event) => {
      if (event.mode !== "surah" && currentSurahRef.current !== null) {
        const audio = audioRef.current;
        if (audio && !audio.paused) audio.pause();
      }
    });
    return unsubscribe;
  }, []);

  const play = useCallback(async (surahNumber: number, surahName: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    broadcastStop("surah", `${surahNumber}`);

    const token = ++playTokenRef.current;
    setCurrentSurah(surahNumber);
    setCurrentSurahName(surahName);
    setProgress(0);
    setDuration(0);
    setError(null);
    setIsLoadingAudio(true);

    audio.removeAttribute("src");
    while (audio.firstChild) audio.removeChild(audio.firstChild);

    const sources = getAudioSources(surahNumber);
    appendAudioSources(audio, sources);
    setAudioUrl(sources[0].src);

    audio.load();
    if (token !== playTokenRef.current) return;

    console.log(`[Audio] Playing surah ${surahNumber}: ${surahName}`);

    const safePlay = async () => {
      try {
        await audio.play();
        if (token === playTokenRef.current) {
          console.log(`[Audio] Successfully started surah ${surahNumber}`);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("[Audio play failed]", {
          name: err instanceof Error ? err.name : "Unknown",
          message: err instanceof Error ? err.message : String(err),
          surah: surahNumber,
        });
        if (token === playTokenRef.current) {
          const msg = getAudioErrorMessage(err);
          if (msg) setError(msg);
          setIsPlaying(false);
        }
      } finally {
        if (token === playTokenRef.current) setIsLoadingAudio(false);
      }
    };

    void safePlay();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      if (currentSurah !== null) broadcastStop("surah", `${currentSurah}`);
      const token = ++playTokenRef.current;
      const safePlay = async () => {
        try {
          await audio.play();
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error("[Audio togglePlay failed]", err);
          if (token === playTokenRef.current) {
            const msg = getAudioErrorMessage(err);
            if (msg) setError(msg);
            setIsPlaying(false);
          }
        }
      };
      void safePlay();
    } else {
      audio.pause();
    }
  }, [currentSurah]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playTokenRef.current++;
    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
    while (audio.firstChild) audio.removeChild(audio.firstChild);
    audio.load();
    setCurrentSurah(null);
    setCurrentSurahName("");
    setAudioUrl("");
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
    setIsLoadingAudio(false);
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(time)) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
    setProgress(audio.currentTime);
  }, []);

  /**
   * Register callback that fires when a surah finishes playing.
   * Returns unsubscribe function.
   *
   * Callback can return `false` to suppress default auto-next behavior
   * (used by queue manager to take over playback control).
   */
  const onSurahEnded = useCallback(
    (callback: (surahNumber: number) => boolean | void) => {
      onEndedCallbacksRef.current.add(callback);
      return () => {
        onEndedCallbacksRef.current.delete(callback);
      };
    },
    [],
  );

  useEffect(() => {
    playRef.current = play;
    stopRef.current = stop;
  }, [play, stop]);

  const value = useMemo<AudioContextValue>(
    () => ({
      currentSurah,
      currentSurahName,
      audioUrl,
      isPlaying,
      progress,
      duration,
      error,
      isLoadingAudio,
      play,
      togglePlay,
      stop,
      seek,
      onSurahEnded,
    }),
    [
      currentSurah,
      currentSurahName,
      audioUrl,
      isPlaying,
      progress,
      duration,
      error,
      isLoadingAudio,
      play,
      togglePlay,
      stop,
      seek,
      onSurahEnded,
    ],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}