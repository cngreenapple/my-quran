import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function SurahListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Memuat daftar surat" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-48" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
      <span className="sr-only">Sedang memuat, harap tunggu...</span>
    </div>
  );
}

export function SurahDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat detail surat" role="status">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3.5 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <span className="sr-only">Sedang memuat, harap tunggu...</span>
    </div>
  );
}