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
import { getAyatAudioUrl, getAyatAudioSources, findWorkingAyatAudioUrl } from "@/lib/api";
import { broadcastStop, subscribeToStop } from "@/lib/audio-coordinator";

interface AyatAudioState {
  surahNumber: number;
  ayatNumber: number;
  url: string;
}

interface AyatAudioContextValue {
  // Current playing ayat
  currentAyat: AyatAudioState | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
  duration: number;
  // Actions
  playAyat: (surahNumber: number, ayatNumber: number) => Promise<void>;
  togglePlay: () => void;
  stop: () => void;
  isCurrentAyat: (surahNumber: number, ayatNumber: number) => boolean;
  isAyatPlaying: (surahNumber: number, ayatNumber: number) => boolean;
  isAyatLoading: (surahNumber: number, ayatNumber: number) => boolean;
}

const AyatAudioContext = createContext<AyatAudioContextValue | null>(null);

function getAudioErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Gagal memutar audio. Silakan coba lagi.";
  }
  if (error.name === "AbortError") {
    return "";
  }
  if (error.name === "NotAllowedError") {
    return "Klik tombol play untuk memulai audio.";
  }
  if (error.name === "NotSupportedError") {
    return "Format audio tidak didukung.";
  }
  return error.message || "Gagal memutar audio.";
}

export function AyatAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTokenRef = useRef(0);
  const [currentAyat, setCurrentAyat] = useState<AyatAudioState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize audio element once
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
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const onError = () => {
      const mediaError = audio.error;
      console.error("[AyatAudio Error]", {
        code: mediaError?.code,
        message: mediaError?.message,
        src: audio.src,
      });
      setIsLoading(false);
      setIsPlaying(false);
      setError("Gagal memuat audio ayat");
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
      audio.load();
    };
  }, []);

  // Stop global saat halaman di-hide / di-close
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const audio = audioRef.current;
        if (audio && !audio.paused) {
          audio.pause();
        }
      }
    };

    const handleBeforeUnload = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Subscribe to coordination events - pause when surah audio starts
  useEffect(() => {
    const unsubscribe = subscribeToStop((event) => {
      if (event.mode !== "ayat" && currentAyat !== null) {
        const audio = audioRef.current;
        if (audio && !audio.paused) {
          audio.pause();
        }
      }
    });
    return unsubscribe;
  }, [currentAyat]);

  const playAyat = useCallback(async (surahNumber: number, ayatNumber: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Broadcast stop ke audio mode lain (surah)
    broadcastStop("ayat", `${surahNumber}:${ayatNumber}`);

    const token = ++playTokenRef.current;
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setDuration(0);

    // Find a working CDN first (pre-flight check)
    let url: string;
    try {
      url = (await findWorkingAyatAudioUrl(surahNumber, ayatNumber)) || getAyatAudioUrl(surahNumber, ayatNumber);
    } catch (err) {
      console.error("[AyatAudio] Failed to find working CDN", err);
      url = getAyatAudioUrl(surahNumber, ayatNumber);
    }

    // Check if this play call is still current
    if (token !== playTokenRef.current) return;

    console.log(`[AyatAudio] Playing ayat ${surahNumber}:${ayatNumber}`, url);
    setCurrentAyat({ surahNumber, ayatNumber, url });
    setIsPlaying(false);

    audio.src = url;
    audio.load();

    const safePlay = async () => {
      try {
        await audio.play();
        if (token === playTokenRef.current) {
          console.log(`[AyatAudio] Successfully started ayat ${surahNumber}:${ayatNumber}`);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("[AyatAudio play failed]", {
          name: err instanceof Error ? err.name : "Unknown",
          message: err instanceof Error ? err.message : String(err),
        });
        if (token === playTokenRef.current) {
          const msg = getAudioErrorMessage(err);
          if (msg) setError(msg);
          setIsPlaying(false);
        }
      } finally {
        if (token === playTokenRef.current) {
          setIsLoading(false);
        }
      }
    };

    void safePlay();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // Saat resume, broadcast stop ke surah (sama seperti playAyat baru)
      if (currentAyat) {
        broadcastStop("ayat", `${currentAyat.surahNumber}:${currentAyat.ayatNumber}`);
      }
      const token = ++playTokenRef.current;
      const safePlay = async () => {
        try {
          await audio.play();
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error("[AyatAudio togglePlay failed]", err);
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
  }, [currentAyat]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playTokenRef.current++;
    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.load();
    setCurrentAyat(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setError(null);
    setIsLoading(false);
  }, []);

  const isCurrentAyat = useCallback(
    (surahNumber: number, ayatNumber: number) => {
      return (
        currentAyat?.surahNumber === surahNumber &&
        currentAyat?.ayatNumber === ayatNumber
      );
    },
    [currentAyat],
  );

  const isAyatPlaying = useCallback(
    (surahNumber: number, ayatNumber: number) => {
      return (
        isCurrentAyat(surahNumber, ayatNumber) && isPlaying
      );
    },
    [isCurrentAyat, isPlaying],
  );

  const isAyatLoading = useCallback(
    (surahNumber: number, ayatNumber: number) => {
      return (
        isCurrentAyat(surahNumber, ayatNumber) && isLoading
      );
    },
    [isCurrentAyat, isLoading],
  );

  // Memoize context value to keep reference stable across renders
  const value = useMemo<AyatAudioContextValue>(
    () => ({
      currentAyat,
      isPlaying,
      isLoading,
      error,
      progress,
      duration,
      playAyat,
      togglePlay,
      stop,
      isCurrentAyat,
      isAyatPlaying,
      isAyatLoading,
    }),
    [
      currentAyat,
      isPlaying,
      isLoading,
      error,
      progress,
      duration,
      playAyat,
      togglePlay,
      stop,
      isCurrentAyat,
      isAyatPlaying,
      isAyatLoading,
    ],
  );

  return (
    <AyatAudioContext.Provider value={value}>
      {children}
    </AyatAudioContext.Provider>
  );
}

export function useAyatAudio() {
  const ctx = useContext(AyatAudioContext);
  if (!ctx) throw new Error("useAyatAudio must be used within AyatAudioProvider");
  return ctx;
}