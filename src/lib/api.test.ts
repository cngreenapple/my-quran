import { describe, expect, it } from "vitest";
import surahsData from "../data/quran/surahs.json";
import { fetchSurahDetail, fetchSurahList } from "./api";

describe("Quran data loader", () => {
  it("loads the bundled surah list", async () => {
    expect(surahsData).toHaveLength(114);

    const surahs = await fetchSurahList();

    expect(surahs).toHaveLength(114);
    expect(surahs[0]).toMatchObject({
      nomor: 1,
      namaLatin: "Al-Fatihah",
    });
  });

  it("loads the bundled surah detail for Al-Fatihah", async () => {
    const detail = await fetchSurahDetail(1);

    expect(detail.nomor).toBe(1);
    expect(detail.ayat).toHaveLength(7);
    expect(detail.ayat[0]).toMatchObject({
      nomorAyat: 1,
      teksIndonesia: expect.stringContaining("Dengan nama Allah"),
    });
  });
});
