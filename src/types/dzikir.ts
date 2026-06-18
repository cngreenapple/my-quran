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
}

export type DoaCategory =
  | "harian"
  | "makan-minum"
  | "tidur"
  | "perjalanan"
  | "ibadah"
  | "keselamatan"
  | "pagi-petang";

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
}