import { useQuery } from "@tanstack/react-query";
import { fetchSurahList } from "@/lib/api";

/**
 * Hook untuk fetch daftar 114 surah.
 *
 * Stale time 24 jam — daftar surah jarang berubah, jadi cache agresif OK.
 * Tidak refetch on window focus untuk hemat network.
 */
export function useSurahList() {
  return useQuery({
    queryKey: ["surah-list"],
    queryFn: fetchSurahList,
    staleTime: 1000 * 60 * 60 * 24, // 24 jam
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}