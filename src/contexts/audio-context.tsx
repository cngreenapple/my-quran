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
import { fetchSurahList } from "@/lib/api";

interface AudioContextValue {
  currentSurah: number | null;
  currentSurahName: string;
  audioUrl: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  error: string | null;
  play: (surahNumber: number, surahName: string) => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (time: number) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

// Daftar CDN fallback untuk audio murottal Al-Afasy
const AUDIO_FALLBACK_URLS = [
  (n: number) => `https://equran.id/media/audio/full/ar.alafasy/${n}.mp3`,
  (n: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`,
  (n: number) => `https://archive.org/download/Alafasy_128/${n.toString().padStart(3, "0")}.mp3`,
];

function getAudioErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Gagal memutar audio. Silakan coba lagi.";
  }
  // AbortError biasanya tidak fatal (race condition antara play/pause)
  if (error.name === "AbortError") {
    return "";
  }
  if (error.name === "NotAllowedError") {
    return "Klik tombol play untuk memulai audio (browser memerlukan interaksi).";
  }
  if (error.name === "NotSupportedError") {
    return "Format audio tidak didukung oleh browser.";
  }
  return error.message || "Gagal memutar audio.";
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTokenRef = useRef(0);
  const fallbackIndexRef = useRef(0);
  const isLoadingRef = useRef(false);

  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [currentSurahName, setCurrentSurahName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
      console.error("[Audio Error]", { code: mediaError?.code, message: mediaError?.message });

      let message = "Gagal memuat audio.";
      if (mediaError) {
        switch (mediaError.code) {
          case 1: message = "Pemutaran audio dibatalkan."; break;
          case 2: message = "Gagal memuat audio. Periksa koneksi internet Anda."; break;
          case 3: message = "Format audio tidak dapat diputar."; break;
          case 4: message = "Sumber audio tidak didukung atau tidak ditemukan."; break;
        }
      }
      setError(message);
      setIsPlaying(false);
    };
    const onCanPlay = () => {
      setError(null);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeAttribute("src");
      audio.load();
    };
  }, [surahList]);

  const play = useCallback((surahNumber: number, surahName: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Increment token to invalidate any previous in-flight play() calls
    const token = ++playTokenRef.current;
    fallbackIndexRef.current = 0;
    isLoadingRef.current = true;

    const url = AUDIO_FALLBACK_URLS[0](surahNumber);
    console.log(`[Audio] Playing surah ${surahNumber}: ${surahName}`, url);

    setCurrentSurah(surahNumber);
    setCurrentSurahName(surahName);
    setAudioUrl(url);
    setProgress(0);
    setDuration(0);
    setError(null);

    audio.src = url;
    audio.load();

    // Use a try/catch wrapper to safely handle the AbortError
    const safePlay = async () => {
      try {
        await audio.play();
        // Only set playing if this is still the active play request
        if (token === playTokenRef.current) {
          console.log(`[Audio] Successfully started surah ${surahNumber}`);
        }
      } catch (err) {
        // AbortError = previous play() was interrupted by new play/pause — ignore it
        if (err instanceof Error && err.name === "AbortError") {
          console.log(`[Audio] Play request ${token} was aborted (superseded by newer request)`);
          return;
        }
        console.error("[Audio play failed]", err);
        if (token === playTokenRef.current) {
          const msg = getAudioErrorMessage(err);
          if (msg) setError(msg);
          setIsPlaying(false);
        }
      } finally {
        if (token === playTokenRef.current) {
          isLoadingRef.current = false;
        }
      }
    };

    void safePlay();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      const token = ++playTokenRef.current;
      const safePlay = async () => {
        try {
          await audio.play();
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            return; // Ignore abort errors
          }
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
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Invalidate any in-flight play() requests
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