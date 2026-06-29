import type { Surah, SurahDetail } from "@/types/quran";
import type { ApiDoaItem } from "@/types/dzikir";

const BASE_URL = "https://equran.id/api/v2";
const TAFSIR_URL = "https://equran.id/api/v2/tafsir";
const DOA_URL = "https://equran.id/api/doa";
const TIMEOUT = 20000;

// ============================================================================
// Qari (Reciter) definitions
// ============================================================================

export interface QariInfo {
  /** API key (e.g. "01", "05") */
  id: string;
  /** Full name */
  name: string;
  /** Short display name */
  shortName: string;
  /** CDN folder name for equran.id audio URLs */
  folder: string;
}

/**
 * 6 qari tersedia di equran.id API.
 * Default: Al-Afasy (id: "05") — paling populer.
 */
export const QARI_LIST: QariInfo[] = [
  { id: "05", name: "Misyari Rasyid Al-Afasy", shortName: "Al-Afasy", folder: "Misyari-Rasyid-Al-Afasi" },
  { id: "01", name: "Abdullah Al-Juhany", shortName: "Al-Juhany", folder: "Abdullah-Al-Juhany" },
  { id: "02", name: "Abdul Muhsin Al-Qasim", shortName: "Al-Qasim", folder: "Abdul-Muhsin-Al-Qasim" },
  { id: "03", name: "Abdurrahman as-Sudais", shortName: "As-Sudais", folder: "Abdurrahman-as-Sudais" },
  { id: "04", name: "Ibrahim Al-Dossari", shortName: "Al-Dossari", folder: "Ibrahim-Al-Dossari" },
  { id: "06", name: "Yasser Al-Dosari", shortName: "Al-Dosari", folder: "Yasser-Al-Dosari" },
];

const QARI_STORAGE_KEY = "quran-selected-qari";
const DEFAULT_QARI_ID = "05";

/**
 * Get qari ID dari localStorage (dipanggil saat play, bukan saat render).
 */
export function getSelectedQariId(): string {
  try {
    return localStorage.getItem(QARI_STORAGE_KEY) || DEFAULT_QARI_ID;
  } catch {
    return DEFAULT_QARI_ID;
  }
}

export function getQariById(id: string): QariInfo {
  return QARI_LIST.find((q) => q.id === id) ?? QARI_LIST[0];
}

function getSelectedQariFolder(): string {
  return getQariById(getSelectedQariId()).folder;
}

// ============================================================================
// Fetch helpers
// ============================================================================

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

/**
 * Fetch kumpulan doa dari equran.id/api/doa
 */
export async function fetchDoaList(): Promise<ApiDoaItem[]> {
  const response = await fetchWithTimeout(DOA_URL);
  const data = await response.json();
  if (data.status !== "success") {
    throw new Error("Gagal mengambil data doa");
  }
  return data.data as ApiDoaItem[];
}

// ============================================================================
// Audio helpers — qari-aware
// ============================================================================

export interface AudioSource {
  src: string;
  type: string;
}

/**
 * Audio sources untuk 1 surah.
 *
 * Priority:
 * 1. equran.id CDN (qari yang dipilih user)
 * 2. QuranicAudio.com (Al-Afasy — fallback)
 * 3. Islamic.network (Al-Afasy — mirror)
 * 4. EveryAyah.com (Al-Afasy — alternative)
 *
 * Browser akan try source pertama, kalau error otomatis ke berikutnya.
 */
export function getAudioSources(surahNumber: number): AudioSource[] {
  const padded = String(surahNumber).padStart(3, "0");
  const folder = getSelectedQariFolder();
  return [
    // Primary: equran.id CDN (qari yang dipilih)
    {
      src: `https://cdn.equran.id/audio-full/${folder}/${padded}.mp3`,
      type: "audio/mpeg",
    },
    // Fallback: external CDNs (hanya Al-Afasy)
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
 * Audio sources untuk 1 ayat.
 *
 * Priority:
 * 1. equran.id CDN (qari yang dipilih user)
 * 2. Islamic.network (Al-Afasy — fallback)
 * 3. EveryAyah.com (Al-Afasy — alternative)
 *
 * Format partial: `surahPadded3 + ayatPadded3` (e.g. "001001" untuk QS.1 ayat 1)
 */
export function getAyatAudioSources(surahNumber: number, ayatNumber: number): AudioSource[] {
  const paddedSurah = String(surahNumber).padStart(3, "0");
  const paddedAyat = String(ayatNumber).padStart(3, "0");
  const combined = `${paddedSurah}${paddedAyat}`;
  const folder = getSelectedQariFolder();
  return [
    // Primary: equran.id CDN (qari yang dipilih)
    {
      src: `https://cdn.equran.id/audio-partial/${folder}/${combined}.mp3`,
      type: "audio/mpeg",
    },
    // Fallback: external CDNs (hanya Al-Afasy)
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