import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Menu } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-[100] w-full border-b border-border bg-background"
      role="banner"
    >
      <div className="container mx-auto flex h-14 items-center justify-between gap-2 px-3 max-w-5xl">
        <button
          onClick={onMenuClick}
          className="relative z-[110] w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center transition-colors"
          aria-label="Buka menu navigasi"
          type="button"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        {/* Logo */}
        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="flex items-center gap-2 group shrink-0"
          aria-label="Al-Quran Digital Indonesia - Halaman utama"
        >
          <div className="relative">
            <div
              className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"
              aria-hidden="true"
            />
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden="true" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm text-foreground leading-tight">
              Al-Quran
            </h1>
            <p className="text-[9px] text-muted-foreground leading-tight font-medium">
              Digital
            </p>
          </div>
        </Link>

        {/* Right: theme */}
        <ThemeSwitcher />
      </div>
    </header>
  );
}