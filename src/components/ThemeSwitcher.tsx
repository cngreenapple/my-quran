import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full relative overflow-hidden" aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"} aria-pressed={isDark}>
      <Sun className={`h-5 w-5 absolute transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} aria-hidden="true" />
      <Moon className={`h-5 w-5 absolute transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} aria-hidden="true" />
      <span className="sr-only">Toggle tema</span>
    </Button>
  );
}