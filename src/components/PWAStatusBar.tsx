import { useState, useEffect } from "react";
import { WifiOff, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/use-pwa";
import { cn } from "@/lib/utils";

/**
 * PWA Status Bar
 *
 * Merender 3 elemen PWA secara global:
 * 1. Offline indicator (top, full-width, amber bar) — muncul saat navigator.onLine === false
 * 2. Install banner (bottom, card) — muncul 3 detik setelah beforeinstallprompt fired
 * 3. Update notification (toast) — di-trigger dari usePWA hook saat SW baru tersedia
 *
 * Z-index strategy:
 * - Header menggunakan z-[1000] (Portal ke document.body)
 * - AudioPlayer menggunakan z-50
 * - PWAStatusBar menggunakan z-[1100] untuk pastikan SELALU di atas
 *
 * Offline indicator push-down: saat offline, set data-offline="true" di <html>.
 * CSS di globals.css rule `html[data-offline="true"] header { top: 40px }` akan
 * push Header ke bawah 40px sehingga menu icon tetap clickable.
 */
export function PWAStatusBar() {
  const { isOnline, isInstallable, isInstalled, promptInstall } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Push Header down saat offline supaya menu icon tidak tertutup indicator
  useEffect(() => {
    const html = document.documentElement;
    if (!isOnline) {
      html.dataset.offline = "true";
    } else {
      delete html.dataset.offline;
    }
    return () => {
      delete html.dataset.offline;
    };
  }, [isOnline]);

  // Tunda 3 detik sebelum munculkan install banner (non-intrusive)
  useEffect(() => {
    if (isInstallable && !isInstalled) {
      const wasDismissed = sessionStorage.getItem("pwa-install-dismissed");
      if (!wasDismissed) {
        const timer = setTimeout(() => setShowInstallBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  return (
    <>
      {/* Offline indicator - top, full-width, amber bar */}
      {!isOnline && (
        <div
          className="fixed top-0 left-0 right-0 z-[1100] bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium shadow-md"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" aria-hidden="true" />
            <span>Anda sedang offline. Menampilkan data yang tersimpan.</span>
          </div>
        </div>
      )}

      {/* Install PWA banner - bottom, above AudioPlayer */}
      {showInstallBanner && !dismissed && (
        <div
          className={cn(
            "fixed left-2 right-2 sm:left-4 sm:right-4 z-[1100] bottom-24 md:bottom-20 animate-fade-in",
          )}
          role="dialog"
          aria-labelledby="pwa-install-title"
        >
          <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                id="pwa-install-title"
                className="font-semibold text-sm text-foreground"
              >
                Install Al-Quran Digital
              </p>
              <p className="text-xs text-muted-foreground">
                Akses lebih cepat & dapat digunakan offline
              </p>
            </div>
            <Button
              size="sm"
              onClick={promptInstall}
              className="rounded-full shrink-0"
              aria-label="Install aplikasi Al-Quran Digital"
            >
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="shrink-0 w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              aria-label="Tutup banner install"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}