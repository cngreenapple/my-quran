import axios from "axios";
import type { Surah, SurahDetail } from "@/types/quran";

const equranApi = axios.create({
  baseURL: "https://equran.id/api/v2",
  timeout: 20000,
});

export async function fetchSurahList(): Promise<Surah[]> {
  const { data } = await equranApi.get("/surat");
  return data.data;
}

export async function fetchSurahDetail(nomor: number): Promise<SurahDetail> {
  const { data } = await equranApi.get(`/surat/${nomor}`);
  return data.data;
}

// Audio dari AlQuran Cloud CDN untuk full surah
export function getAudioUrl(nomor: number): string {
  return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${nomor}.mp3`;
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}