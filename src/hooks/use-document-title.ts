import { useEffect, useRef } from "react";

const APP_NAME = "Al-Quran Digital Indonesia";

/**
 * Stack-based document title management.
 *
 * Race condition fix: kalau 2 halaman mount/unmount hampir bersamaan,
 * pattern capture-prev-then-restore-on-cleanup akan menghasilkan wrong
 * title. Contoh tanpa stack:
 *
 *   - Page A mounts → prev = "App", set "Page A"
 *   - Page B mounts → prev = "Page A", set "Page B"
 *   - Page A unmounts → restore prev = "App" ❌ (kita mau "Page B")
 *
 * Dengan stack:
 *   - Page A mounts → stack.push("Page A"), top = "Page A", set title
 *   - Page B mounts → stack.push("Page B"), top = "Page B", set title
 *   - Page A unmounts → stack.pop(), top masih "Page B" → no-op
 *   - Page B unmounts → stack.pop(), top = "App" → set title
 *
 * Pakai module-level ref (bukan React state) supaya:
 * - Tidak trigger re-render
 * - Persistent across hot-reload
 * - Shared across all hook instances (semua page share stack yang sama)
 */
const titleStack: string[] = [];
let mountedCount = 0;

function pushTitle(title: string) {
  const finalTitle = title ? `${title} • ${APP_NAME}` : APP_NAME;
  titleStack.push(finalTitle);
  mountedCount++;
  document.title = finalTitle;
}

function popTitle() {
  mountedCount--;
  titleStack.pop();
  // Hanya restore title jika tidak ada mounted page lagi
  // (kalau masih ada page lain di stack, title tetap yang mereka set)
  if (mountedCount === 0) {
    document.title = APP_NAME;
  } else {
    const top = titleStack[titleStack.length - 1];
    if (top) document.title = top;
  }
}

export function useDocumentTitle(title?: string) {
  // useRef untuk track value ini mount/unmount.
  // title di-pass ke pushTitle sekali saat mount.
  // Kalau title berubah saat mounted, kita update top of stack.
  const initialTitleRef = useRef<string | undefined>(title);

  useEffect(() => {
    pushTitle(initialTitleRef.current ?? "");
    return () => {
      popTitle();
    };
  }, []);

  // Kalau title prop berubah setelah mount, update top of stack.
  useEffect(() => {
    if (title === initialTitleRef.current) return;
    initialTitleRef.current = title;

    // Hanya update jika ini topmost title
    if (mountedCount > 0) {
      const finalTitle = title ? `${title} • ${APP_NAME}` : APP_NAME;
      // Replace top of stack
      titleStack[titleStack.length - 1] = finalTitle;
      document.title = finalTitle;
    }
  }, [title]);
}