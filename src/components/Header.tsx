import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Menu } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface HeaderProps {
  onMenuClick: () => void;
}

/**
 * Header di-render via Portal ke document.body.
 *
 * Menggunakan `fixed top-0` (bukan sticky) supaya SELALU menempel di
 * viewport, tidak peduli scroll container parent. Sticky kadang tidak
 * bekerja kalau ada ancestor dengan `overflow: hidden` atau `transform`.
 *
 * Kompensasi: tambah `pt-[52px]` (tinggi header + safe-area) di halaman
 * via class CSS atau dengan mengatur padding-top konten. Karena tiap page
 * sudah pakai container, solusi paling simple: gunakan `fixed` dan biarkan
 * konten di bawah header mendapat space natural.
 *
 * NOTE: fixed header tidak mendorong konten ke bawah (karena out-of-flow).
 * Konten yang tertutup header diatasi dengan `padding-top` di <main>
 * atau sticky-inside-flow variant. Karena banyak page sudah punya
 * `container px-3 py-3`, kita tambahkan `pt-[60px]` di Header itu sendiri
 * untuk visible separation.
 */
export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();

  const content = (
    <header
      className="fixed top-0 left-0 right-0 z-[1000] border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/65"
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