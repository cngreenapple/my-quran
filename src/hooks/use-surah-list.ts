import { useQuery } from "@tanstack/react-query";
import { fetchSurahList } from "@/lib/api";

export function useSurahList() {
  return useQuery({
    queryKey: ["surah-list"],
    queryFn: fetchSurahList,
    staleTime: 1000 * 60 * 60 * 24, // 24 jam - daftar surat jarang berubah
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}