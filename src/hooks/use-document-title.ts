import { useEffect } from "react";

const APP_NAME = "Al-Quran Digital";
const DEFAULT_TITLE = "Al-Quran Digital Indonesia";

/**
 * Set document.title per page.
 *
 * Behavior:
 * - title provided: `${title} | ${APP_NAME}` (e.g. "Pengaturan | Al-Quran Digital")
 * - title undefined/empty: APP_NAME default
 * - When component unmounts: title sticks at last set value (intentional —
 *   next page's effect will override anyway, no flash)
 *
 * Initial title is set in index.html `<title>` tag (DEFAULT_TITLE).
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (title && title.trim()) {
      document.title = `${title} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }
  }, [title]);
}