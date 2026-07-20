import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const BASE_URL = "https://equran.id/api/v2";
const TAFSIR_URL = "https://equran.id/api/v2/tafsir";
const OUT_DIR = path.resolve(process.cwd(), "src/data/quran");

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const surahListResponse = await fetchJson(`${BASE_URL}/surat`);
  const surahList = surahListResponse.data ?? [];

  const surahDetails = [];
  const tafsirEntries = [];

  for (const item of surahList) {
    const [detailResponse, tafsirResponse] = await Promise.all([
      fetchJson(`${BASE_URL}/surat/${item.nomor}`),
      fetchJson(`${TAFSIR_URL}/${item.nomor}`),
    ]);

    surahDetails.push(detailResponse.data);
    tafsirEntries.push({
      nomor: item.nomor,
      nama: item.namaLatin,
      tafsir: tafsirResponse.data?.tafsir ?? [],
    });

    console.log(`Downloaded ${item.nomor}. ${item.namaLatin}`);
  }

  await writeFile(path.join(OUT_DIR, "surahs.json"), JSON.stringify(surahDetails, null, 2));
  await writeFile(path.join(OUT_DIR, "tafsir.json"), JSON.stringify(tafsirEntries, null, 2));

  console.log(`Saved ${surahDetails.length} surah(s) and ${tafsirEntries.length} tafsir entry(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
