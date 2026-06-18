import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Terjadi Kesalahan", message = "Gagal memuat data. Periksa koneksi internet Anda dan coba lagi.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in" role="alert" aria-live="assertive">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3" aria-hidden="true">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">{message}</p>
      {onRetry && <Button onClick={onRetry} variant="default" className="rounded-full h-9" aria-label="Coba memuat ulang">Coba Lagi</Button>}
    </div>
  );
}