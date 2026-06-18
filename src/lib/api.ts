import type { Surah, SurahDetail } from "@/types/quran";

const BASE_URL = "https://equran.id/api/v2";
const TIMEOUT = 20000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.srcsignal,
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

// Audio murottal Al-Afasy dari beberapa CDN
// Format: 3-digit padded surah number (001, 002, ..., 114)
const pad3 = (n: number) => n.toString().padStart(3, "0");

const AUDIO_CDNS = [
  // Primary - QuranicAudio.com (official Al-Afasy)
  (n: number) => `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${pad3(n)}.mp3`,
  // Fallback 1 - server8.mp3quran.net
  (n: number) => `https://server8.mp3quran.net/afs/${pad3(n)}.mp3`,
  // Fallback 2 - everyayah.com
  (n: number) => `https://everyayah.com/data/Alafasy_128kbps/${pad3(n)}001.mp3`,
  // Fallback 3 - Islamic Network
  (n: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`,
];

// Returns primary audio URL (dipakai untuk initial load — fast path)
export function getAudioUrl(nomor: number): string {
  return AUDIO_CDNS[0](nomor);
}

// Returns all fallback URLs untuk <audio> element dengan multiple <source> tags.
// Audio element HTML5 akan otomatis try source kedua kalau source pertama error.
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

// Returns all fallback URLs untuk per-ayat audio
export function getAyatAudioSources(surah: number, ayat: number): { src: string; type: string }[] {
  return AYAT_AUDIO_CDNS.map((fn) => ({
    src: fn(surah, ayat),
    type: "audio/mpeg",
  }));
}

/**
 * Helper: append multiple <source> elements ke <audio> untuk fallback otomatis.
 * Browser akan otomatis try next source kalau current source error.
 *
 * Catatan: pakai ini LEBIH BAIK dari HEAD pre-flight check karena:
 * 1. HEAD tidak reliable — beberapa CDN return 403 untuk HEAD walaupun GET works
 * 2. Tidak ada delay tambahan sebelum playback dimulai
 * 3. Browser handle fallback secara native dengan error recovery
 */
export function appendAudioSources(audio: HTMLAudioElement, sources: { src: string; type: string }[]): void {
  for (const s of sources) {
    const source = document.createElement("source");
    source.src = s.src;
    source.type = s.type;
    audio.appendChild(source);
  }
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}