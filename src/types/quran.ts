export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull?: Record<string, string>;
}

export interface AyatTafsir {
  kemenag?: {
    teks: string;
  };
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio?: Record<string, string>;
  tafsir?: AyatTafsir;
}

export interface SurahDetail extends Surah {
  ayat: Ayat[];
  audioFull: Record<string, string>;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  timestamp: number;
}

export interface BookmarkItem {
  id: string;
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  note?: string;
  previewText?: string;
  timestamp: number;
}

/**
 * Shared color variant type — digunakan di seluruh app untuk
 * dzikir, doa, asmaul husna, holiday, puasa sunnah, dll.
 * Extract ke satu tempat supaya konsisten dan mudah di-maintain.
 */
export type ColorVariant = "emerald" | "amber" | "sky" | "rose" | "violet";