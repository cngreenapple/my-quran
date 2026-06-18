import { useQuery } from "@tanstack/react-query";
import { fetchSurahDetail } from "@/lib/api";

/**
 * Hook untuk fetch detail 1 surah (ayat, tafsir, audio URLs).
 *
 * Stale time 1 jam — ayat & terjemahan static, jadi cache 1 jam cukup.
 * gcTime 24 jam — keep cached detail di memory selama mungkin
 * supaya navigasi balik ke surah yang sama instant.
 *
 * `enabled` guard: query hanya fire kalau nomor valid (1-114).
 * Tanpa guard, queryKey invalid akan di-fetch dan error.
 */
export function useSurahDetail(nomor: number) {
  return useQuery({
    queryKey: ["surah", nomor],
    queryFn: () => fetchSurahDetail(nomor),
    enabled: !!nomor && nomor >= 1 && nomor <= 114,
    staleTime: 1000 * 60 * 60, // 1 jam
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}