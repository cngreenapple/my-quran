import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Menu } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface HeaderProps {
  onMenuClick: () => void;
}

/**
 * Header di-render via Portal ke document.body supaya menang stacking order
 * dari Toaster/Sonner viewport (lihat globals.css untuk detail).
 */
export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();

  const content = (
    <header
      className="sticky top-0 z-[1000] w-full border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/65"
      role="banner"
    >
      <div className="container mx-auto flex h-13 items-center justify-between gap-2 px-3 max-w-5xl">
        <button
          onClick={onMenuClick}
          className="relative z-[1010] icon-btn h-10 w-10"
          aria-label="Buka menu navigasi"
          type="button"
        >
          <Menu className="w-5 h-5 text-foreground" aria-hidden="true" />
        </button>

        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="flex items-center gap-2 group shrink-0"
          aria-label="Al-Quran Digital - Halaman utama"
        >
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm shadow-emerald-500/30">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-sm font-bold text-foreground tracking-tight">Al-Quran</span>
            <span className="text-[9px] text-muted-foreground font-medium tracking-wide uppercase">Digital</span>
          </div>
        </Link>

        <ThemeSwitcher />
      </div>
    </header>
  );

  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}