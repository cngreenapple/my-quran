import type { ColorVariant } from "@/types/quran";

export interface DzikirItem {
  id: string;
  arabic: string;
  latin: string;
  translation: string;
  count: number;
  fawaid?: string;
  source?: string;
}

export interface DzikirCategory {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: ColorVariant;
  items: DzikirItem[];
}

export interface DoaItem {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  category: DoaCategory;
  source?: string;
  /** Catatan tambahan / penjelasan doa (dari API equran.id) */
  catatan?: string;
}

export type DoaCategory = string; // Sekarang dinamis dari grup API

export interface DoaCategoryInfo {
  id: DoaCategory;
  name: string;
  icon: string;
  color: ColorVariant;
}

export interface DzikirCounter {
  itemId: string;
  categoryId: string;
  current: number;
  target: number;
  lastUpdated: number;
  completed: boolean;
  totalCompleted: number;
  dateKey: string; // YYYY-MM-DD — untuk auto-reset harian
}

/**
 * Tipe untuk response API equran.id/api/doa
 */
export interface ApiDoaItem {
  id: number;
  grup: string;
  nama: string;
  ar: string;
  tr: string;
  idn: string;
  tentang: string;
  tag: string[];
}