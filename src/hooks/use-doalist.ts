import { useQuery } from "@tanstack/react-query";
import { fetchDoaList } from "@/lib/api";
import type { ApiDoaItem } from "@/types/dzikir";

/**
 * Hook untuk fetch daftar doa dari equran.id API.
 *
 * Stale time 24 jam — data doa statis.
 */
export function useDoaList() {
  return useQuery<ApiDoaItem[]>({
    queryKey: ["doa-list"],
    queryFn: fetchDoaList,
    staleTime: 1000 * 60 * 60 * 24, // 24 jam
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}