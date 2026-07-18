import { useEffect } from "react";

/**
 * Register Service Worker untuk PWA installability.
 *
 * Browser TIDAK akan fire `beforeinstallprompt` event kalau
 * Service Worker belum registered. Ini adalah salah satu criteria
 * wajib PWA installability.
 *
 * Hook ini handle:
 * - Auto-register `sw.js` di root
 * - Listen untuk update event → trigger custom event `sw-update-available`
 *   yang bisa di-listen oleh komponen UI (misal AppShell) untuk
 *   menampilkan snackbar "Update tersedia. Muat ulang?"
 * - Tidak langsung reload halaman — menghindari gangguan saat user
 *   sedang baca Al-Qur'an.
 * - Error handling yang silent (gagal register = gak critical,
 *   app tetap jalan normal tanpa offline support)
 */
export function useServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register di root scope `/`
    const swUrl = "/sw.js";

    navigator.serviceWorker
      .register(swUrl, { scope: "/" })
      .then((registration) => {
        console.log("[SW] Registered:", registration.scope);

        // Check update setiap kali halaman dimuat
        registration.update().catch((err) => {
          console.warn("[SW] Update check failed", err);
        });

        // Listen untuk update — kalau ada SW baru, trigger custom event
        // sehingga UI bisa menampilkan snackbar, bukan reload paksa
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("[SW] New version available");
              // Trigger custom event untuk UI snackbar
              window.dispatchEvent(
                new CustomEvent("sw-update-available", {
                  detail: { registration, newWorker },
                }),
              );
            }
          });
        });
      })
      .catch((err) => {
        // Silent fail — PWA optional, app tetap jalan tanpa offline
        console.warn("[SW] Registration failed", err);
      });
  }, []);
}