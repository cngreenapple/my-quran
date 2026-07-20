import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const surahsPath = path.join(projectRoot, 'src/data/quran/surahs.json');
const tafsirPath = path.join(projectRoot, 'src/data/quran/tafsir.json');

function getSingleValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

async function readJson(filePath) {
  const file = await readFile(filePath, 'utf8');
  return JSON.parse(file);
}

export default async function handler(req, res) {
  const type = getSingleValue(req.query?.type) ?? 'surahs';
  const nomorParam = getSingleValue(req.query?.nomor);
  const nomor = nomorParam ? Number(nomorParam) : undefined;

  try {
    const [surahs, tafsirData] = await Promise.all([
      readJson(surahsPath),
      readJson(tafsirPath),
    ]);

    if (type === 'surahs') {
      return res.status(200).json({ success: true, data: surahs });
    }

    if (type === 'detail') {
      if (!Number.isInteger(nomor)) {
        return res.status(400).json({ success: false, error: 'nomor is required' });
      }
      const detail = surahs.find((surah) => surah.nomor === nomor);
      if (!detail) {
        return res.status(404).json({ success: false, error: 'surah not found' });
      }
      return res.status(200).json({ success: true, data: detail });
    }

    if (type === 'tafsir') {
      if (!Number.isInteger(nomor)) {
        return res.status(400).json({ success: false, error: 'nomor is required' });
      }
      const tafsir = tafsirData.find((item) => item.nomor === nomor);
      return res.status(200).json({ success: true, data: tafsir?.tafsir ?? [] });
    }

    if (type === 'qari') {
      return res.status(200).json({
        success: true,
        data: [
          { id: '05', name: 'Misyari Rasyid Al-Afasy', folder: 'Misyari-Rasyid-Al-Afasi' },
          { id: '01', name: 'Abdullah Al-Juhany', folder: 'Abdullah-Al-Juhany' },
          { id: '02', name: 'Abdul Muhsin Al-Qasim', folder: 'Abdul-Muhsin-Al-Qasim' },
          { id: '03', name: 'Abdurrahman as-Sudais', folder: 'Abdurrahman-as-Sudais' },
          { id: '04', name: 'Ibrahim Al-Dossari', folder: 'Ibrahim-Al-Dossari' },
          { id: '06', name: 'Yasser Al-Dosari', folder: 'Yasser-Al-Dosari' },
        ],
      });
    }

    return res.status(400).json({ success: false, error: 'unsupported type' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
