import type { DoaItem, DoaCategory, DoaCategoryInfo } from "@/types/dzikir";

export const DOA_CATEGORIES: DoaCategoryInfo[] = [
  { id: "harian", name: "Harian", icon: "🌞", color: "emerald" },
  { id: "makan-minum", name: "Makan & Minum", icon: "🍽️", color: "amber" },
  { id: "tidur", name: "Tidur", icon: "🌙", color: "violet" },
  { id: "perjalanan", name: "Perjalanan", icon: "✈️", color: "sky" },
  { id: "ibadah", name: "Ibadah", icon: "🕌", color: "emerald" },
  { id: "keselamatan", name: "Keselamatan", icon: "🛡️", color: "rose" },
  { id: "pagi-petang", name: "Pagi & Petang", icon: "🌅", color: "amber" },
];

export const DOA_ITEMS: DoaItem[] = [
  // Harian
  {
    id: "doa-masuk-kamar-mandi",
    title: "Doa Masuk Kamar Mandi",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ",
    latin: "Allāhumma innī a'ūdhu bika minal-khubutsi wal-khabā'its",
    translation: "Ya Allah, sesungguhnya aku berlindung kepada-Mu dari godaan setan laki-laki dan setan perempuan.",
    category: "harian",
    source: "HR. Bukhari & Muslim",
  },
  {
    id: "doa-keluar-kamar-mandi",
    title: "Doa Keluar Kamar Mandi",
    arabic: "غُفْرَانَكَ",
    latin: "Ghufraanak",
    translation: "Aku memohon ampunan-Mu (Ya Allah).",
    category: "harian",
    source: "HR. Abu Dawud & Tirmidzi",
  },
  {
    id: "doa-masuk-rumah",
    title: "Doa Masuk Rumah",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    latin: "Bismillāhi walaj'nā, wa bismillāhi kharaj'nā, wa 'alallāhi rabbinā tawakkalnā",
    translation: "Dengan nama Allah kami masuk, dengan nama Allah kami keluar, dan kepada Allah Tuhan kami, kami bertawakal.",
    category: "harian",
    source: "HR. Abu Dawud",
  },
  {
    id: "doa-memakai-pakaian",
    title: "Doa Memakai Pakaian",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ",
    latin: "Al-ḥamdu lillāhilladhī kasānī hādhā wa razaqanīhi min ghairi ḥaulin minnī wa lā quwwah",
    translation: "Segala puji bagi Allah yang telah memberi pakaian ini kepadaku dan memberikannya sebagai rezeki kepadaku tanpa daya dan kekuatan dariku.",
    category: "harian",
    source: "HR. Abu Dawud & Tirmidzi",
  },
  {
    id: "doa-melepas-pakaian",
    title: "Doa Melepas Pakaian",
    arabic: "بِسْمِ اللَّهِ",
    latin: "Bismillāh",
    translation: "Dengan nama Allah.",
    category: "harian",
    source: "HR. Tirmidzi",
  },
  {
    id: "doa-masuk-masjid",
    title: "Doa Masuk Masjid",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    latin: "Allāhummaftaḥ lī abwāba raḥmatik",
    translation: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.",
    category: "harian",
    source: "HR. Muslim",
  },
  {
    id: "doa-keluar-masjid",
    title: "Doa Keluar Masjid",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    latin: "Allāhumma innī as'aluka min faḍlik",
    translation: "Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu.",
    category: "harian",
    source: "HR. Muslim",
  },

  // Makan & Minum
  {
    id: "doa-sebelum-makan",
    title: "Doa Sebelum Makan",
    arabic: "بِسْمِ اللَّهِ",
    latin: "Bismillāh",
    translation: "Dengan nama Allah.",
    category: "makan-minum",
    source: "HR. Bukhari & Muslim",
  },
  {
    id: "doa-setelah-makan",
    title: "Doa Setelah Makan",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    latin: "Al-ḥamdu lillāhilladhī aṭ'amānā wa saqānā wa ja'alānā muslimīn",
    translation: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami sebagai orang-orang Muslim.",
    category: "makan-minum",
    source: "HR. Abu Dawud",
  },
  {
    id: "doa-minum-air",
    title: "Doa Minum Air",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ رَحْمَتَكَ فِي الْحَيَاةِ وَالْمَمَاتِ",
    latin: "Allāhumma innī as'aluka raḥmataka fil-ḥayāti wal-mamāt",
    translation: "Ya Allah, sesungguhnya aku memohon rahmat-Mu dalam kehidupan dan kematian.",
    category: "makan-minum",
    source: "HR. An-Nasa'i",
  },

  // Tidur
  {
    id: "doa-sebelum-tidur",
    title: "Doa Sebelum Tidur",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    latin: "Bismika allāhumma amūtu wa aḥyā",
    translation: "Dengan nama-Mu ya Allah, aku mati dan aku hidup.",
    category: "tidur",
    source: "HR. Bukhari",
  },
  {
    id: "doa-bangun-tidur",
    title: "Doa Bangun Tidur",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    latin: "Al-ḥamdu lillāhilladhī aḥyānā ba'da mā amātanā wa ilaihin-nusyūr",
    translation: "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya kebangkitan.",
    category: "tidur",
    source: "HR. Bukhari & Muslim",
  },

  // Perjalanan
  {
    id: "doa-naik-kendaraan",
    title: "Doa Naik Kendaraan",
    arabic: "بِسْمِ اللَّهِ، الْحَمْدُ لِلَّهِ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    latin: "Bismillāh, al-ḥamdu lillāh, subḥānalladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn",
    translation: "Dengan nama Allah, segala puji bagi Allah, Maha Suci Tuhan yang telah menundukkan kendaraan ini untuk kami, padahal kami tidak mampu menguasainya.",
    category: "perjalanan",
    source: "HR. Muslim",
  },
  {
    id: "doa-perjalanan",
    title: "Doa Bepergian Jauh",
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى",
    latin: "Allāhumma innā nas'aluka fī safarinā hādzal-birra wat-taqwā, wa minal-'amali mā tarḍā",
    translation: "Ya Allah, kami memohon kepada-Mu dalam perjalanan ini kebaikan dan ketaqwaan, dan amal yang Engkau ridhai.",
    category: "perjalanan",
    source: "HR. Muslim",
  },

  // Ibadah
  {
    id: "doa-iftitah",
    title: "Doa Iftitah (Pembuka Sholat)",
    arabic: "اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ، كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ",
    latin: "Allāhumma bā'id baynī wa bayna khaṭāyāya, kamā bā'adta baynal-masyriqi wal-maghrib",
    translation: "Ya Allah, jauhkanlah antara aku dan kesalahan-kesalahanku, sebagaimana Engkau menjauhkan antara timur dan barat.",
    category: "ibadah",
    source: "HR. Bukhari & Muslim",
  },
  {
    id: "doa-ruku",
    title: "Doa Ruku'",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    latin: "Subḥāna rabbiyal-'aẓīm",
    translation: "Maha Suci Tuhanku Yang Maha Agung.",
    category: "ibadah",
    source: "HR. Abu Dawud",
  },
  {
    id: "doa-sujud",
    title: "Doa Sujud",
    arabic: "سُبْحَانَ رَبِّيَ الأَعْلَى",
    latin: "Subḥāna rabbiyal-a'lā",
    translation: "Maha Suci Tuhanku Yang Maha Tinggi.",
    category: "ibadah",
    source: "HR. Abu Dawud",
  },
  {
    id: "doa-setelah-salam",
    title: "Doa Setelah Salam",
    arabic: "اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ",
    latin: "Allāhumma antas-salām, wa minkas-salām, tabārakta yā dzal-jalāli wal-ikrām",
    translation: "Ya Allah, Engkau adalah keselamatan, dari-Mu keselamatan, Maha Berkah Engkau wahai Yang Maha Agung dan Maha Mulia.",
    category: "ibadah",
    source: "HR. Muslim",
  },
  {
    id: "doa-witir",
    title: "Doa Qunut Witir",
    arabic: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ",
    latin: "Allāhumma-hdinī fīman hadait, wa 'āfinī fīman 'āfait, wa tawallanī fīman tawallait",
    translation: "Ya Allah, berilah aku petunjuk seperti orang-orang yang telah Engkau beri petunjuk, berilah aku kesehatan seperti orang-orang yang telah Engkau beri kesehatan, dan peliharalah aku seperti orang-orang yang telah Engkau pelihara.",
    category: "ibadah",
    source: "HR. Abu Dawud & Tirmidzi",
  },

  // Keselamatan
  {
    id: "doa-keselamatan",
    title: "Doa Mohon Keselamatan",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
    latin: "Allāhumma innī as'alukal-'afwa wal-'āfiyah fid-dunyā wal-ākhirah",
    translation: "Ya Allah, sesungguhnya aku memohon ampunan dan keselamatan di dunia dan akhirat.",
    category: "keselamatan",
    source: "HR. Tirmidzi & Ibnu Majah",
  },
  {
    id: "doa-minta-rezeki",
    title: "Doa Memohon Rezeki",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً",
    latin: "Allāhumma innī as'aluka 'ilman nāfi'an, wa rizqan ṭayyiban, wa 'amalan mutaqabbalan",
    translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.",
    category: "keselamatan",
    source: "HR. Ibnu Majah",
  },
  {
    id: "doa-orang-tua",
    title: "Doa untuk Kedua Orang Tua",
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    latin: "Rabbi-rḥamhumā kamā rabbayānī ṣaghīrā",
    translation: "Ya Tuhanku, kasihilah mereka keduanya, sebagaimana mereka berdua telah mendidik aku waktu kecil.",
    category: "keselamatan",
    source: "QS. Al-Isra: 24",
  },

  // Pagi & Petang (extra)
  {
    id: "doa-bangun-pagi",
    title: "Doa Bangun Pagi",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    latin: "Ashbaḥnā wa ashbaḥal-mulku lillāhi rabbil-'ālamīn",
    translation: "Kami telah memasuki waktu pagi, dan kerajaan milik Allah, Tuhan semesta alam.",
    category: "pagi-petang",
    source: "HR. Muslim",
  },
];

export function getDoaByCategory(category: DoaCategory): DoaItem[] {
  return DOA_ITEMS.filter((d) => d.category === category);
}

export function getDoaCategoryInfo(category: DoaCategory): DoaCategoryInfo | undefined {
  return DOA_CATEGORIES.find((c) => c.id === category);
}