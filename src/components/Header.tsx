import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Home,
  Settings as SettingsIcon,
  Clock,
  BookHeart,
  Hand,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";

const navItems = [
  { to: "/", label: "Beranda", icon: Home, ariaLabel: "Halaman utama" },
  { to: "/jadwal-sholat", label: "Sholat", icon: Clock, ariaLabel: "Jadwal sholat" },
  { to: "/dzikir", label: "Dzikir", icon: BookHeart, ariaLabel: "Dzikir pagi dan petang" },
  { to: "/doa", label: "Doa", icon: Hand, ariaLabel: "Kumpulan doa" },
  { to: "/kalender", label: "Kalender", icon: Calendar, ariaLabel: "Kalender Hijriah" },
  { to: "/settings", label: "Setting", icon: SettingsIcon, ariaLabel: "Pengaturan aplikasi" },
];

// Mobile shows 4 most-used; Asmaul Husna & Settings accessible dari Index/header
const mobileNavItems = [
  navItems[0], // Beranda
  navItems[1], // Sholat
  navItems[2], // Dzikir
  navItems[3], // Doa
];

export function Header() {
  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
        role="banner"
      >
        <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 max-w-5xl">
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="Al-Quran Digital Indonesia - Halaman utama"
          >
            <div className="relative">
              <div
                className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"
                aria-hidden="true"
              />
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} aria-hidden="true" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-base text-foreground leading-tight">
                Al-Quran
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight font-medium">
                Digital Indonesia
              </p>
            </div>
          </Link>

          {/* Desktop Nav - scrollable on smaller screens */}
          <nav
            className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar"
            aria-label="Menu navigasi utama"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )
                  }
                  aria-label={item.ariaLabel}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {item.label}
                      {isActive && <span className="sr-only"> (halaman aktif)</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "lg:hidden w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )
              }
              aria-label="Buka pengaturan"
            >
              <SettingsIcon className="w-4 h-4" aria-hidden="true" />
            </NavLink>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </>
  );
}

function BottomNav() {
  const location = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl pb-safe"
      aria-label="Menu navigasi bawah"
    >
      <div className="grid grid-cols-4 gap-0.5 p-1.5 max-w-2xl mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground active:scale-95",
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform",
                  isActive && "scale-110",
                )}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[9px] font-semibold tracking-wide leading-tight",
                  isActive && "font-bold",
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}