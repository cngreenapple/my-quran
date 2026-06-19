import type { Surah, SurahDetail } from "@/types/quran";

const BASE_URL = "https://equran.id/api/v2";
const TAFSIR_URL = "https://equran.id/api/v2/tafsir";
const TIMEOUT = 20000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchSurahList(): Promise<Surah[]> {
  const response = await fetchWithTimeout(`${BASE_URL}/surat`);
  const data = await response.json();
  return data.data;
}

export async function fetchSurahDetail(nomor: number): Promise<SurahDetail> {
  const response = await fetchWithTimeout(`${BASE_URL}/surat/${nomor}`);
  const data = await response.json();
  return data.data;
}

/**
 * Tafsir Kemenag per surah.
 * Endpoint: GET https://equran.id/api/v2/tafsir/{nomor}
 *
 * Response shape:
 * {
 *   code: 200,
 *   data: {
 *     nomor: 1,
 *     nama: "Al-Fatihah",
 *     tafsir: [
 *       { ayat: 1, teks: "..." },
 *       { ayat: 2, teks: "..." }
 *     ]
 *   }
 * }
 */
export interface TafsirItem {
  ayat: number;
  teks: string;
}

export interface TafsirSurahResponse {
  nomor: number;
  nama: string;
  tafsir: TafsirItem[];
}

export async function fetchTafsirSurah(nomor: number): Promise<TafsirItem[]> {
  const response = await fetchWithTimeout(`${TAFSIR_URL}/${nomor}`);
  const data = await response.json();
  return data.data?.tafsir ?? [];
}

// ============================================================================
// Audio helpers
// ============================================================================

/**
 * Audio source info untuk fallback otomatis.
 * Browser akan try src pertama, kalau error try src berikutnya, dst.
 */
export interface AudioSource {
  src: string;
  type: string;
}

/**
 * Multiple CDN fallback untuk audio murottal Al-Afasy (per surah).
 * Format: padded 3-digit number (e.g. 001, 002, ..., 114).
 *
 * Sumber CDN:
 * 1. QuranicAudio.com (primary — official Al-Afasy)
 * 2. Islamic.network (mirror)
 * 3. EveryAyah.com (alternative)
 */
export function getAudioSources(surahNumber: number): AudioSource[] {
  const padded = String(surahNumber).padStart(3, "0");
  return [
    {
      src: `https://download.quranicaudio.com/quran/mishary_rashid_alafasy/${padded}.mp3`,
      type: "audio/mpeg",
    },
    {
      src: `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`,
      type: "audio/mpeg",
    },
    {
      src: `https://everyayah.com/data/Alafasy_128kbps/${padded}surah.mp3`,
      type: "audio/mpeg",
    },
  ];
}

/**
 * Multiple CDN fallback untuk audio murottal per ayat.
 * Format: surah:ayat (e.g. 1:1, 114:6)
 */
export function getAyatAudioSources(surahNumber: number, ayatNumber: number): AudioSource[] {
  return [
    {
      src: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNumber}:${ayatNumber}.mp3`,
      type: "audio/mpeg",
    },
    {
      src: `https://everyayah.com/data/Alafasy_128kbps/${surahNumber}_${ayatNumber}.mp3`,
      type: "audio/mpeg",
    },
  ];
}

/**
 * Append <source> children ke HTMLAudioElement untuk fallback otomatis.
 * Browser otomatis try source berikutnya kalau current source error.
 *
 * Hapus src & <source> lama sebelum append supaya tidak ada duplikat.
 */
export function appendAudioSources(
  audio: HTMLAudioElement,
  sources: AudioSource[],
): void {
  for (const source of sources) {
    const el = document.createElement("source");
    el.src = source.src;
    el.type = source.type;
    audio.appendChild(el);
  }
}

/**
 * Format detik ke "mm:ss" atau "h:mm:ss" jika > 1 jam.
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const totalSec = Math.floor(seconds);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}