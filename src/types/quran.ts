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

export interface BookmarkItem {
  id: string;
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  teksArab: string;
  teksIndonesia: string;
  timestamp: number;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  timestamp: number;
}