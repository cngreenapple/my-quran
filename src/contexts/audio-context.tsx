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
import { fetchSurahList, getAudioUrl } from "@/lib/api";

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

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => {
      setIsPlaying(true);
      setError(null);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      // Auto-next surah
      if (currentSurah && currentSurah < 114) {
        const next = currentSurah + 1;
        const nextSurahInfo = surahList?.find((s) => s.nomor === next);
        const nextName = nextSurahInfo?.namaLatin || `Surah ${next}`;
        play(next, nextName);
      } else {
        stop();
      }
    };
    const onError = () => {
      setError("Gagal memuat audio. Silakan coba lagi.");
      setIsPlaying(false);
    };
    const onWaiting = () => setError(null);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSurah, surahList]);

  const play = useCallback((surahNumber: number, surahName: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = getAudioUrl(surahNumber);
    setCurrentSurah(surahNumber);
    setCurrentSurahName(surahName);
    setAudioUrl(url);
    setProgress(0);
    setDuration(0);
    setError(null);
    audio.src = url;
    audio.load();
    audio.play().catch((err) => {
      console.error("Audio play failed:", err);
      setError("Gagal memutar audio. Periksa koneksi Anda.");
    });
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch((err) => {
        console.error("Audio play failed:", err);
        setError("Gagal memutar audio.");
      });
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
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