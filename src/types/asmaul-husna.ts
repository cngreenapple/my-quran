import type { ColorVariant } from "@/types/quran";

export interface AsmaulHusna {
  number: number;
  arabic: string;
  latin: string;
  meaningId: string;
  meaningEn: string;
  benefit: string;
  color?: ColorVariant; // computed from number % 5
}