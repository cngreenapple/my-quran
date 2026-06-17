import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSurahList, findWorkingAudioUrl } from "@/lib/api";
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
    return "Format audio tidak didukung oleh sumber. Mencoba sumber lain...";
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

  const { data: surahList } = useQuery({
    queryKey: ["surah-list"],
    queryFn: fetchSurahList,
    staleTime: Infinity,
  });

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
    const onWaiting = () => setIsLoadingAudio(true);
    const onCanPlay = () => {
      setIsLoadingAudio(false);
      setError(null);
    };
    const onEnded = () => {
      setCurrentSurah((prev) => {
        if (prev && prev < 114) {
          const next = prev + 1;
          const nextSurahInfo = surahList?.find((s) => s.nomor === next);
          const nextName = nextSurahInfo?.namaLatin || `Surah ${next}`;
          setTimeout(() => play(next, nextName), 0);
          return prev;
        }
        setTimeout(() => stop(), 0);
        return prev;
      });
    };
    const onError = () => {
      const mediaError = audio.error;
      console.error("[Audio Error]", {
        code: mediaError?.code,
        message: mediaError?.message,
        src: audio.src,
        surah: currentSurah,
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
      // Pastikan audio di-pause saat cleanup (route change / unmount)
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, [currentSurah, surahList]);

  // Stop global saat halaman di-hide / di-close (mobile tab, browser close, dll)
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

  // Subscribe to coordination events - pause when ayat audio starts
  useEffect(() => {
    const unsubscribe = subscribeToStop((event) => {
      if (event.mode !== "surah" && currentSurah !== null) {
        const audio = audioRef.current;
        if (audio && !audio.paused) {
          audio.pause();
        }
      }
    });
    return unsubscribe;
  }, [currentSurah]);

  const play = useCallback(async (surahNumber: number, surahName: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Broadcast stop ke audio mode lain (ayat)
    broadcastStop("surah", `${surahNumber}`);

    const token = ++playTokenRef.current;
    setCurrentSurah(surahNumber);
    setCurrentSurahName(surahName);
    setProgress(0);
    setDuration(0);
    setError(null);
    setIsLoadingAudio(true);

    // Find a working CDN first (pre-flight check)
    let url: string;
    try {
      url = (await findWorkingAudioUrl(surahNumber)) || "";
    } catch (err) {
      console.error("[Audio] Failed to find working CDN", err);
      url = `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${surahNumber.toString().padStart(3, "0")}.mp3`;
    }

    // Check if this play call is still current
    if (token !== playTokenRef.current) return;

    console.log(`[Audio] Playing surah ${surahNumber}: ${surahName}`, url);
    setAudioUrl(url);

    audio.src = url;
    audio.load();

    const safePlay = async () => {
      try {
        await audio.play();
        if (token === playTokenRef.current) {
          console.log(`[Audio] Successfully started surah ${surahNumber}`);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
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
        if (token === playTokenRef.current) {
          setIsLoadingAudio(false);
        }
      }
    };

    void safePlay();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // Saat resume, broadcast stop ke ayat (sama seperti play surah baru)
      if (currentSurah !== null) {
        broadcastStop("surah", `${currentSurah}`);
      }
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

  return (
    <AudioContext.Provider
      value={{
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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}