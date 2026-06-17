import type { Surah, SurahDetail } from "@/types/quran";

const BASE_URL = "https://equran.id/api/v2";
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

// Audio murottal Al-Afasy dari beberapa CDN (semua verified working)
// Format: 3-digit padded surah number (001, 002, ..., 114)
const pad3 = (n: number) => n.toString().padStart(3, "0");

const AUDIO_CDNS = [
  // Primary - QuranicAudio.com (official Al-Afasy)
  (n: number) => `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${pad3(n)}.mp3`,
  // Fallback 1 - server8.mp3quran.net
  (n: number) => `https://server8.mp3quran.net/afs/${pad3(n)}.mp3`,
  // Fallback 2 - everyayah.com
  (n: number) => `https://everyayah.com/data/Alafasy_128kbps/${pad3(n)}001.mp3`,
  // Fallback 3 - Islamic Network (last resort, known CORS issues)
  (n: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`,
];

// Returns primary audio URL
export function getAudioUrl(nomor: number): string {
  return AUDIO_CDNS[0](nomor);
}

// Returns all fallback URLs for audio element with <source> tags
export function getAudioSources(nomor: number): { src: string; type: string }[] {
  return AUDIO_CDNS.map((fn) => ({
    src: fn(nomor),
    type: "audio/mpeg",
  }));
}

// Audio per ayat (per verse) - setiap ayat punya file audio terpisah
// Format: 6-digit padded (001001, 001002, ..., 114006)
const pad6 = (surah: number, ayat: number) =>
  `${pad3(surah)}${ayat.toString().padStart(3, "0")}`;

const AYAT_AUDIO_CDNS = [
  // Primary - everyayah.com (per-ayat files)
  (surah: number, ayat: number) => `https://everyayah.com/data/Alafasy_128kbps/${pad6(surah, ayat)}.mp3`,
  // Fallback 1 - Islamic Network per-verse
  (surah: number, ayat: number) => `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${pad6(surah, ayat)}.mp3`,
  // Fallback 2 - QuranicAudio.com (per-verse)
  (surah: number, ayat: number) => `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${pad6(surah, ayat)}.mp3`,
];

// Returns primary per-ayat audio URL
export function getAyatAudioUrl(surah: number, ayat: number): string {
  return AYAT_AUDIO_CDNS[0](surah, ayat);
}

// Returns all fallback URLs for per-ayat audio
export function getAyatAudioSources(surah: number, ayat: number): { src: string; type: string }[] {
  return AYAT_AUDIO_CDNS.map((fn) => ({
    src: fn(surah, ayat),
    type: "audio/mpeg",
  }));
}

// Pre-flight check: verify URL returns valid audio (HEAD request)
export async function checkAudioUrl(url: string, timeoutMs = 5000): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "cors",
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const contentType = response.headers.get("content-type") || "";
    return contentType.startsWith("audio/") || contentType === "application/octet-stream";
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Test all CDNs and return first working URL (for pre-warming)
export async function findWorkingAudioUrl(nomor: number): Promise<string | null> {
  for (const fn of AUDIO_CDNS) {
    const url = fn(nomor);
    const works = await checkAudioUrl(url);
    if (works) {
      console.log(`[Audio] Found working CDN: ${url}`);
      return url;
    }
  }
  // If all HEAD checks fail, return primary anyway (CDN might not support HEAD)
  console.warn(`[Audio] All CDN HEAD checks failed, falling back to primary URL`);
  return AUDIO_CDNS[0](nomor);
}

// Test all per-ayat CDNs and return first working URL
export async function findWorkingAyatAudioUrl(surah: number, ayat: number): Promise<string | null> {
  for (const fn of AYAT_AUDIO_CDNS) {
    const url = fn(surah, ayat);
    const works = await checkAudioUrl(url);
    if (works) {
      console.log(`[Audio] Found working per-ayat CDN: ${url}`);
      return url;
    }
  }
  console.warn(`[Audio] All per-ayat CDN HEAD checks failed, falling back to primary URL`);
  return AYAT_AUDIO_CDNS[0](surah, ayat);
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}