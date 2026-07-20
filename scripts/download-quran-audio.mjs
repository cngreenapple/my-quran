import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const surahs = JSON.parse(await (await import('node:fs/promises')).readFile(path.resolve('src/data/quran/surahs.json'), 'utf8'));
const qariFolders = [
  'Misyari-Rasyid-Al-Afasi',
  'Abdullah-Al-Juhany',
  'Abdul-Muhsin-Al-Qasim',
  'Abdurrahman-as-Sudais',
  'Ibrahim-Al-Dossari',
  'Yasser-Al-Dosari',
];

const root = path.resolve('public/audio');
await mkdir(root, { recursive: true });

async function downloadFile(url, dest) {
  if (existsSync(dest)) {
    return false;
  }
  await mkdir(path.dirname(dest), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(dest, buffer);
  return true;
}

let downloaded = 0;
for (const folder of qariFolders) {
  const folderRoot = path.join(root, folder);
  const fullRoot = path.join(folderRoot, 'full');
  const partialRoot = path.join(folderRoot, 'partial');
  await mkdir(fullRoot, { recursive: true });
  await mkdir(partialRoot, { recursive: true });

  for (const surah of surahs) {
    const surahNum = String(surah.nomor).padStart(3, '0');
    const fullName = `${surahNum}.mp3`;
    const fullPath = path.join(fullRoot, fullName);
    try {
      const didDownload = await downloadFile(`https://cdn.equran.id/audio-full/${folder}/${fullName}`, fullPath);
      if (didDownload) {
        downloaded += 1;
        console.log(`downloaded full ${folder}/${fullName}`);
      }
    } catch (error) {
      console.log(`skip full ${folder}/${fullName}`, error.message);
    }

    for (let ayat = 1; ayat <= surah.jumlahAyat; ayat += 1) {
      const ayatName = `${surahNum}${String(ayat).padStart(3, '0')}.mp3`;
      const ayatPath = path.join(partialRoot, ayatName);
      try {
        const didDownload = await downloadFile(`https://cdn.equran.id/audio-partial/${folder}/${ayatName}`, ayatPath);
        if (didDownload) {
          downloaded += 1;
          console.log(`downloaded partial ${folder}/${ayatName}`);
        }
      } catch (error) {
        console.log(`skip partial ${folder}/${ayatName}`, error.message);
      }
    }
  }
}

console.log(`Finished. Downloaded ${downloaded} file(s).`);
