import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "quran-theme";

/**
 * Theme hook — manage light/dark mode dengan persistence ke localStorage.
 *
 * Behavior:
 * - Initial value: localStorage > prefers-color-scheme (system) > light
 * - Apply: tambah/hapus class "dark" di document.documentElement
 * - Persist: save ke localStorage setiap perubahan
 *
 * Mendengarkan prefers-color-scheme tidak diimplementasikan — kalau user
 * ganti system theme, aplikasi tetap di mode yang user pilih.
 * (By design — user lebih suka kontrol eksplisit.)
 */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme };
}