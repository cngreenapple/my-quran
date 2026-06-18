import type { AsmaulHusna } from "@/types/asmaul-husna";
import type { ColorVariant } from "@/types/quran";

/**
 * Compute color variant dari nomor asma (round-robin 5 colors).
 * Konsisten dengan dzikir/doa color scheme.
 */
function computeColor(number: number): ColorVariant {
  const colors: ColorVariant[] = ["emerald", "amber", "sky", "rose", "violet"];
  return colors[(number - 1) % colors.length];
}

const ASMAUL_HUSNA_DATA: Omit<AsmaulHusna, "color">[] = [
  { number: 1, arabic: "الرَّحْمَنُ", latin: "Ar-Raḥmān", meaningId: "Maha Pengasih", meaningEn: "The Most Compassionate", benefit: "Membuka pintu rezeki dan kasih sayang Allah" },
  { number: 2, arabic: "الرَّحِيمُ", latin: "Ar-Raḥīm", meaningId: "Maha Penyayang", meaningEn: "The Most Merciful", benefit: "Mendapatkan kasih sayang di dunia dan akhirat" },
  { number: 3, arabic: "الْمَلِكُ", latin: "Al-Malik", meaningId: "Maha Merajai", meaningEn: "The King", benefit: "Memiliki kewibawaan dan kehormatan" },
  { number: 4, arabic: "الْقُدُّوسُ", latin: "Al-Quddūs", meaningId: "Maha Suci", meaningEn: "The Most Holy", benefit: "Membersihkan hati dari segala penyakit" },
  { number: 5, arabic: "السَّلاَمُ", latin: "As-Salām", meaningId: "Maha Memberi Kesejahteraan", meaningEn: "The Source of Peace", benefit: "Mendapatkan ketenangan dan kedamaian hati" },
  { number: 6, arabic: "الْمُؤْمِنُ", latin: "Al-Mu'min", meaningId: "Maha Memberi Keamanan", meaningEn: "The Inspirer of Faith", benefit: "Mendapatkan ketenangan jiwa dan keselamatan" },
  { number: 7, arabic: "الْمُهَيْمِنُ", latin: "Al-Muhaymin", meaningId: "Maha Mengawasi", meaningEn: "The Guardian", benefit: "Dilindungi dari segala mara bahaya" },
  { number: 8, arabic: "الْعَزِيزُ", latin: "Al-'Azīz", meaningId: "Maha Perkasa", meaningEn: "The Almighty", benefit: "Mendapatkan kekuatan dan kemuliaan" },
  { number: 9, arabic: "الْجَبَّارُ", latin: "Al-Jabbār", meaningId: "Maha Memaksa", meaningEn: "The Compeller", benefit: "Menundukkan orang yang sombong dan dzalim" },
  { number: 10, arabic: "الْمُتَكَبِّرُ", latin: "Al-Mutakabbir", meaningId: "Maha Megah", meaningEn: "The Greatest", benefit: "Mendapatkan keagungan dan kebesaran hati" },
  { number: 11, arabic: "الْخَالِقُ", latin: "Al-Khāliq", meaningId: "Maha Pencipta", meaningEn: "The Creator", benefit: "Mudah dalam menciptakan dan membangun" },
  { number: 12, arabic: "الْبَارِئُ", latin: "Al-Bāri'", meaningId: "Maha Melepaskan", meaningEn: "The Maker of Order", benefit: "Terlepas dari segala kesulitan" },
  { number: 13, arabic: "الْمُصَوِّرُ", latin: "Al-Muṣawwir", meaningId: "Maha Membentuk Rupa", meaningEn: "The Shaper", benefit: "Mendapatkan keturunan yang shaleh" },
  { number: 14, arabic: "الْغَفَّارُ", latin: "Al-Ghaffār", meaningId: "Maha Pengampun", meaningEn: "The Forgiving", benefit: "Diampuni dosa-dosa" },
  { number: 15, arabic: "الْقَهَّارُ", latin: "Al-Qahhār", meaningId: "Maha Menundukkan", meaningEn: "The Subduer", benefit: "Menundukkan hawa nafsu" },
  { number: 16, arabic: "الْوَهَّابُ", latin: "Al-Wahhāb", meaningId: "Maha Pemberi Karunia", meaningEn: "The Giver of All", benefit: "Mendapatkan karunia yang berlimpah" },
  { number: 17, arabic: "الرَّزَّاقُ", latin: "Ar-Razzāq", meaningId: "Maha Pemberi Rezeki", meaningEn: "The Sustainer", benefit: "Rezeki yang lancar dan cukup" },
  { number: 18, arabic: "الْفَتَّاحُ", latin: "Al-Fattāḥ", meaningId: "Maha Membuka", meaningEn: "The Opener", benefit: "Terbuka pintu rezeki dan jalan keluar" },
  { number: 19, arabic: "الْعَلِيمُ", latin: "Al-'Alīm", meaningId: "Maha Mengetahui", meaningEn: "The All-Knowing", benefit: "Mendapatkan ilmu yang bermanfaat" },
  { number: 20, arabic: "الْقَابِضُ", latin: "Al-Qābiḍ", meaningId: "Maha Menyempitkan", meaningEn: "The Constrictor", benefit: "Terhindar dari sifat kikir" },
  { number: 21, arabic: "الْبَاسِطُ", latin: "Al-Bāsiṭ", meaningId: "Maha Melapangkan", meaningEn: "The Reliever", benefit: "Dilapangkan rezeki dan hati" },
  { number: 22, arabic: "الْخَافِضُ", latin: "Al-Khāfiḍ", meaningId: "Maha Merendahkan", meaningEn: "The Abaser", benefit: "Direndahkan bagi orang yang sombong" },
  { number: 23, arabic: "الرَّافِعُ", latin: "Ar-Rāfi'", meaningId: "Maha Meninggikan", meaningEn: "The Exalter", benefit: "Mendapatkan derajat yang tinggi" },
  { number: 24, arabic: "الْمُعِزُّ", latin: "Al-Mu'izz", meaningId: "Maha Memuliakan", meaningEn: "The Bestower of Honor", benefit: "Dimuliakan di dunia dan akhirat" },
  { number: 25, arabic: "الْمُذِلُّ", latin: "Al-Mudhill", meaningId: "Maha Menghinakan", meaningEn: "The Humiliator", benefit: "Terlindung dari kehinaan" },
  { number: 26, arabic: "السَّمِيعُ", latin: "As-Samī'", meaningId: "Maha Mendengar", meaningEn: "The All-Hearing", benefit: "Doa-doa dikabulkan" },
  { number: 27, arabic: "الْبَصِيرُ", latin: "Al-Baṣīr", meaningId: "Maha Melihat", meaningEn: "The All-Seeing", benefit: "Dilihat Allah dengan kasih sayang" },
  { number: 28, arabic: "الْحَكَمُ", latin: "Al-Ḥakam", meaningId: "Maha Menghukum", meaningEn: "The Judge", benefit: "Diberi keadilan dalam hidup" },
  { number: 29, arabic: "الْعَدْلُ", latin: "Al-'Adl", meaningId: "Maha Adil", meaningEn: "The Just", benefit: "Mendapatkan keadilan" },
  { number: 30, arabic: "اللَّطِيفُ", latin: "Al-Laṭīf", meaningId: "Maha Lembut", meaningEn: "The Subtle One", benefit: "Dihaluskan urusan dan rezeki" },
  { number: 31, arabic: "الْخَبِيرُ", latin: "Al-Khabīr", meaningId: "Maha Mengenal", meaningEn: "The All-Aware", benefit: "Mendapatkan kemudahan dalam segala urusan" },
  { number: 32, arabic: "الْحَلِيمُ", latin: "Al-Ḥalīm", meaningId: "Maha Penyantun", meaningEn: "The Forbearing", benefit: "Disantuni ketika berbuat kesalahan" },
  { number: 33, arabic: "الْعَظِيمُ", latin: "Al-'Aẓīm", meaningId: "Maha Agung", meaningEn: "The Magnificent", benefit: "Mendapatkan keagungan dan kemuliaan" },
  { number: 34, arabic: "الْغَفُورُ", latin: "Al-Ghafūr", meaningId: "Maha Pengampun", meaningEn: "The Forgiver", benefit: "Selalu diampuni dosa" },
  { number: 35, arabic: "الشَّكُورُ", latin: "Ash-Shakūr", meaningId: "Maha Penerima Syukur", meaningEn: "The Rewarder of Thankfulness", benefit: "Mendapatkan balasan yang berlipat ganda" },
  { number: 36, arabic: "الْعَلِيُّ", latin: "Al-'Aliyy", meaningId: "Maha Tinggi", meaningEn: "The Most High", benefit: "Mendapatkan derajat yang tinggi" },
  { number: 37, arabic: "الْكَبِيرُ", latin: "Al-Kabīr", meaningId: "Maha Besar", meaningEn: "The Greatest", benefit: "Dibesarkan namanya di dunia" },
  { number: 38, arabic: "الْحَفِيظُ", latin: "Al-Ḥafīẓ", meaningId: "Maha Memelihara", meaningEn: "The Preserver", benefit: "Dilindungi dari segala bencana" },
  { number: 39, arabic: "الْمُقِيتُ", latin: "Al-Muqīt", meaningId: "Maha Pemberi Kecukupan", meaningEn: "The Nourisher", benefit: "Mendapatkan kecukupan rezeki" },
  { number: 40, arabic: "الْحَسِيبُ", latin: "Al-Ḥasīb", meaningId: "Maha Penghitung", meaningEn: "The Accounter", benefit: "Diperhitungkan amal baiknya" },
  { number: 41, arabic: "الْجَلِيلُ", latin: "Al-Jalīl", meaningId: "Maha Mulia", meaningEn: "The Mighty", benefit: "Mendapatkan kemuliaan" },
  { number: 42, arabic: "الْكَرِيمُ", latin: "Al-Karīm", meaningId: "Maha Mulia (Pemurah)", meaningEn: "The Generous", benefit: "Mendapatkan kemurahan rezeki" },
  { number: 43, arabic: "الرَّقِيبُ", latin: "Ar-Raqīb", meaningId: "Maha Mengawasi", meaningEn: "The Watchful One", benefit: "Mendapatkan pengawasan dari Allah" },
  { number: 44, arabic: "الْمُجِيبُ", latin: "Al-Mujīb", meaningId: "Maha Mengabulkan", meaningEn: "The Responder to Prayer", benefit: "Doa-doa cepat dikabulkan" },
  { number: 45, arabic: "الْوَاسِعُ", latin: "Al-Wāsi'", meaningId: "Maha Luas", meaningEn: "The All-Comprehending", benefit: "Dilapangkan rezeki dan ilmu" },
  { number: 46, arabic: "الْحَكِيمُ", latin: "Al-Ḥakīm", meaningId: "Maha Bijaksana", meaningEn: "The Perfectly Wise", benefit: "Diberi hikmah dan kebijakan" },
  { number: 47, arabic: "الْوَدُودُ", latin: "Al-Wadūd", meaningId: "Maha Mencintai", meaningEn: "The Loving One", benefit: "Dicintai Allah dan manusia" },
  { number: 48, arabic: "الْمَجِيدُ", latin: "Al-Majīd", meaningId: "Maha Mulia", meaningEn: "The Majestic One", benefit: "Mendapatkan kemuliaan yang abadi" },
  { number: 49, arabic: "الْبَاعِثُ", latin: "Al-Bā'ith", meaningId: "Maha Membangkitkan", meaningEn: "The Resurrector", benefit: "Dihidupkan hatinya untuk beribadah" },
  { number: 50, arabic: "الشَّهِيدُ", latin: "Ash-Shahīd", meaningId: "Maha Menyaksikan", meaningEn: "The Witness", benefit: "Menjadi saksi kebenaran" },
  { number: 51, arabic: "الْحَقُّ", latin: "Al-Ḥaqq", meaningId: "Maha Benar", meaningEn: "The Truth", benefit: "Mendapatkan kebenaran" },
  { number: 52, arabic: "الْوَكِيلُ", latin: "Al-Wakīl", meaningId: "Maha Mempercayakan", meaningEn: "The Trustee", benefit: "Dipercaya dalam mengemban amanah" },
  { number: 53, arabic: "الْقَوِيُّ", latin: "Al-Qawiyy", meaningId: "Maha Kuat", meaningEn: "The Possessor of All Strength", benefit: "Diberi kekuatan iman" },
  { number: 54, arabic: "الْمَتِينُ", latin: "Al-Matīn", meaningId: "Maha Kokoh", meaningEn: "The Forceful One", benefit: "Kokoh dalam menghadapi cobaan" },
  { number: 55, arabic: "الْوَلِيُّ", latin: "Al-Walī", meaningId: "Maha Pelindung", meaningEn: "The Governor", benefit: "Mendapatkan perlindungan Allah" },
  { number: 56, arabic: "الْحَمِيدُ", latin: "Al-Ḥamīd", meaningId: "Maha Terpuji", meaningEn: "The Praised One", benefit: "Mendapatkan pujian" },
  { number: 57, arabic: "الْمُحْصِي", latin: "Al-Muḥṣī", meaningId: "Maha Menghitung", meaningEn: "The Appraiser", benefit: "Diperhitungkan setiap amal" },
  { number: 58, arabic: "الْمُبْدِئُ", latin: "Al-Mubdi'", meaningId: "Maha Memulai", meaningEn: "The Originator", benefit: "Diawali dengan kebaikan" },
  { number: 59, arabic: "الْمُعِيدُ", latin: "Al-Mu'īd", meaningId: "Maha Mengembalikan", meaningEn: "The Restorer", benefit: "Dikembalikan kepada fitrah" },
  { number: 60, arabic: "الْمُحْيِي", latin: "Al-Muḥyī", meaningId: "Maha Menghidupkan", meaningEn: "The Giver of Life", benefit: "Hidup yang penuh berkah" },
  { number: 61, arabic: "الْمُمِيتُ", latin: "Al-Mumīt", meaningId: "Maha Mematikan", meaningEn: "The Taker of Life", benefit: "Kematian dalam ketaatan" },
  { number: 62, arabic: "الْحَيُّ", latin: "Al-Ḥayy", meaningId: "Maha Hidup", meaningEn: "The Ever Living One", benefit: "Hidup yang tidak pernah mati" },
  { number: 63, arabic: "الْقَيُّومُ", latin: "Al-Qayyūm", meaningId: "Maha Berdiri Sendiri", meaningEn: "The Self-Existing One", benefit: "Tidak pernah bergantung pada selain-Nya" },
  { number: 64, arabic: "الْوَاجِدُ", latin: "Al-Wājid", meaningId: "Maha Penemu", meaningEn: "The Finder", benefit: "Mendapatkan apa yang dicari" },
  { number: 65, arabic: "الْمَاجِدُ", latin: "Al-Mājid", meaningId: "Maha Mulia", meaningEn: "The Glorious", benefit: "Mendapatkan kemuliaan" },
  { number: 66, arabic: "الْوَاحِدُ", latin: "Al-Wāḥid", meaningId: "Maha Tunggal", meaningEn: "The Only One", benefit: "Mendapatkan ketenangan dalam tauhid" },
  { number: 67, arabic: "الْأَحَدُ", latin: "Al-Aḥad", meaningId: "Maha Esa", meaningEn: "The One", benefit: "Tidak ada sekutu bagi-Nya" },
  { number: 68, arabic: "الصَّمَدُ", latin: "Aṣ-Ṣamad", meaningId: "Maha Dibutuhkan", meaningEn: "The Eternal", benefit: "Semua bergantung kepada-Nya" },
  { number: 69, arabic: "الْقَادِرُ", latin: "Al-Qādir", meaningId: "Maha Berkuasa", meaningEn: "The Able", benefit: "Mampu melewati segala kesulitan" },
  { number: 70, arabic: "الْمُقْتَدِرُ", latin: "Al-Muqtadir", meaningId: "Maha Berkuasa Penuh", meaningEn: "The Powerful", benefit: "Tak terkalahkan" },
  { number: 71, arabic: "الْمُقَدِّمُ", latin: "Al-Muqaddim", meaningId: "Maha Mendahulukan", meaningEn: "The Expediter", benefit: "Didahulukan dalam kebaikan" },
  { number: 72, arabic: "الْمُؤَخِّرُ", latin: "Al-Mu'akhkhir", meaningId: "Maha Mengakhirkan", meaningEn: "The Delayer", benefit: "Ditunda dari kemudaratan" },
  { number: 73, arabic: "الْأَوَّلُ", latin: "Al-Awwal", meaningId: "Maha Awal", meaningEn: "The First", benefit: "Didahulukan dalam segala urusan" },
  { number: 74, arabic: "الْآخِرُ", latin: "Al-Ākhir", meaningId: "Maha Akhir", meaningEn: "The Last", benefit: "Akhir yang baik" },
  { number: 75, arabic: "الظَّاهِرُ", latin: "Aẓ-Ẓāhir", meaningId: "Maha Nyata", meaningEn: "The Manifest One", benefit: "Terbukti kebenarannya" },
  { number: 76, arabic: "الْبَاطِنُ", latin: "Al-Bāṭin", meaningId: "Maha Ghaib", meaningEn: "The Hidden One", benefit: "Mengetahui yang ghaib" },
  { number: 77, arabic: "الْوَالِيَ", latin: "Al-Wālī", meaningId: "Maha Memerintah", meaningEn: "The Protecting Friend", benefit: "Mendapatkan pertolongan" },
  { number: 78, arabic: "الْمُتَعَالِي", latin: "Al-Muta'ālī", meaningId: "Maha Tinggi", meaningEn: "The Supreme One", benefit: "Terangkat derajatnya" },
  { number: 79, arabic: "الْبَرُّ", latin: "Al-Barr", meaningId: "Maha Dermawan", meaningEn: "The Doer of Good", benefit: "Kebaikan yang berlimpah" },
  { number: 80, arabic: "التَّوَّابُ", latin: "At-Tawwāb", meaningId: "Maha Penerima Tobat", meaningEn: "The Acceptor of Repentance", benefit: "Tobat diterima" },
  { number: 81, arabic: "الْمُنْتَقِمُ", latin: "Al-Muntaqim", meaningId: "Maha Pemberi Balasan", meaningEn: "The Avenger", benefit: "Terlindung dari kezaliman" },
  { number: 82, arabic: "الْعَفُوُّ", latin: "Al-'Afuww", meaningId: "Maha Pemaaf", meaningEn: "The Forgiver", benefit: "Dimaafkan kesalahannya" },
  { number: 83, arabic: "الرَّؤُوفُ", latin: "Ar-Ra'ūf", meaningId: "Maha Pengasih", meaningEn: "The Clement", benefit: "Disayang dengan lembut" },
  { number: 84, arabic: "مَالِكُ الْمُلْكِ", latin: "Mālik-ul-Mulk", meaningId: "Maha Penguasa Kerajaan", meaningEn: "The Owner of All", benefit: "Diberi kerajaan dan kepemimpinan" },
  { number: 85, arabic: "ذُو الْجَلاَلِ وَالْإِكْرَامِ", latin: "Dhū-l-Jalāli wal-Ikrām", meaningId: "Maha Pemilik Keagungan dan Kemuliaan", meaningEn: "The Lord of Majesty", benefit: "Diagungkan dan dimuliakan" },
  { number: 86, arabic: "الْمُقْسِطُ", latin: "Al-Muqsit", meaningId: "Maha Adil", meaningEn: "The Equitable One", benefit: "Keadilan sempurna" },
  { number: 87, arabic: "الْجَامِعُ", latin: "Al-Jāmi'", meaningId: "Maha Mengumpulkan", meaningEn: "The Gatherer", benefit: "Dihimpun dalam kebaikan" },
  { number: 88, arabic: "الْغَنِيُّ", latin: "Al-Ghanī", meaningId: "Maha Kaya", meaningEn: "The Rich One", benefit: "Terlepas dari kebutuhan manusia" },
  { number: 89, arabic: "الْمُغْنِي", latin: "Al-Mughnī", meaningId: "Maha Pemberi Kekayaan", meaningEn: "The Enricher", benefit: "Diperkaya hati dan jiwa" },
  { number: 90, arabic: "الْمَانِعُ", latin: "Al-Māni'", meaningId: "Maha Pencegah", meaningEn: "The Preventer", benefit: "Terpelihara dari kemudaratan" },
  { number: 91, arabic: "الضَّارُّ", latin: "Aḍ-Ḍārr", meaningId: "Maha Pemberi Bahaya", meaningEn: "The Distresser", benefit: "Terhindar dari bahaya" },
  { number: 92, arabic: "النَّافِعُ", latin: "An-Nāfi'", meaningId: "Maha Pemberi Manfaat", meaningEn: "The Propitious", benefit: "Mendapatkan manfaat" },
  { number: 93, arabic: "النُّورُ", latin: "An-Nūr", meaningId: "Maha Bercahaya", meaningEn: "The Light", benefit: "Hati diterangi cahaya" },
  { number: 94, arabic: "الْهَادِي", latin: "Al-Hādī", meaningId: "Maha Pemberi Petunjuk", meaningEn: "The Guide", benefit: "Diberi petunjuk ke jalan lurus" },
  { number: 95, arabic: "الْبَدِيعُ", latin: "Al-Badī'", meaningId: "Maha Pencipta Tanpa Contoh", meaningEn: "The Originator", benefit: "Kreasi yang unik" },
  { number: 96, arabic: "الْبَاقِي", latin: "Al-Bāqī", meaningId: "Maha Kekal", meaningEn: "The Everlasting One", benefit: "Kekal dalam ketaatan" },
  { number: 97, arabic: "الْوَارِثُ", latin: "Al-Wārith", meaningId: "Maha Pewaris", meaningEn: "The Inheritor", benefit: "Mewarisi kebahagiaan" },
  { number: 98, arabic: "الرَّشِيدُ", latin: "Ar-Rashīd", meaningId: "Maha Pandai", meaningEn: "The Righteous Teacher", benefit: "Diberi petunjuk ke jalan benar" },
  { number: 99, arabic: "الصَّبُورُ", latin: "Aṣ-Ṣabūr", meaningId: "Maha Sabar", meaningEn: "The Patient One", benefit: "Diberi kesabaran yang luas" },
];

// Build final data with computed color
export const ASMAUL_HUSNA: AsmaulHusna[] = ASMAUL_HUSNA_DATA.map((a) => ({
  ...a,
  color: computeColor(a.number),
}));

// Dev-only validation: catch missing/duplicate at import time
if (typeof window !== "undefined" && import.meta.env?.DEV) {
  const numbers = ASMAUL_HUSNA_DATA.map((a) => a.number);
  const unique = new Set(numbers);
  if (numbers.length !== 99) {
    console.error(`[AsmaulHusna] Expected 99 entries, got ${numbers.length}`);
  }
  if (unique.size !== 99) {
    console.error(`[AsmaulHusna] Duplicate numbers detected: ${numbers.length - unique.size} duplicates`);
  }
  // Check sequential
  for (let i = 1; i <= 99; i++) {
    if (!unique.has(i)) {
      console.error(`[AsmaulHusna] Missing number: ${i}`);
    }
  }
}

export function getAsmaByNumber(n: number) {
  return ASMAUL_HUSNA.find((a) => a.number === n);
}