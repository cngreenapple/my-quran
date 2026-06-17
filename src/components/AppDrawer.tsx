import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Bookmark,
  StickyNote,
  Clock,
  Star,
  BookHeart,
  Hand,
  Compass,
  Moon,
  Calendar,
  Video,
  Info,
  X,
  ArrowUp,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/bookmark", label: "Bookmark", icon: Bookmark },
  { to: "/catatan", label: "Catatan", icon: StickyNote },
  { to: "/jadwal-sholat", label: "Jadwal Sholat", icon: Clock },
  { to: "/asmaul-husna", label: "Asmaul Husna", icon: Star },
  { to: "/dzikir", label: "Dzikir", icon: BookHeart },
  { to: "/doa", label: "Doa", icon: Hand },
  { to: "/arah-kiblat", label: "Arah Kiblat", icon: Compass },
  { to: "/puasa-sunnah", label: "Puasa Sunnah", icon: Moon },
  { to: "/kalender", label: "Kalender Islam", icon: Calendar },
  { to: "/live-makkah", label: "Live Makkah & Madinah", icon: Video },
  { to: "/tentang", label: "Tentang", icon: Info },
];

interface AppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppDrawer({ open, onOpenChange }: AppDrawerProps) {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Track mount + visibility separately for smooth enter/exit animation
  // while keeping element removed from DOM after exit completes
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Wait one frame so transition runs from translate-x-full -> translate-x-0
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else if (mounted) {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 320); // matches duration-300 + buffer
      return () => clearTimeout(timer);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (open) {
      const main = document.querySelector("main");
      if (main) {
        setShowScrollTop(main.scrollTop > 200);
        const handler = () => setShowScrollTop(main.scrollTop > 200);
        main.addEventListener("scroll", handler);
        return () => main.removeEventListener("scroll", handler);
      }
    }
  }, [open, location.pathname]);

  // Close on route change
  useEffect(() => {
    onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleScrollTop = () => {
    const main = document.querySelector("main");
    main?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Backdrop - rendered only when mounted for clean interaction */}
      {mounted && (
        <div
          className={cn(
            "fixed inset-0 z-[80] bg-black/60 transition-opacity duration-300",
            visible ? "opacity-100" : "opacity-0",
          )}
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      {mounted && (
        <aside
          className={cn(
            "fixed top-0 left-0 bottom-0 z-[90] w-[280px] sm:w-[320px] bg-[#0f2319] text-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
            visible ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M12 2 L20 10 L12 18 L4 10 Z" opacity="0.9" />
                <path d="M12 6 L16 10 L12 14 L8 10 Z" opacity="0.7" />
                <path d="M12 10 L13.5 11.5 L12 13 L10.5 11.5 Z" />
              </svg>
            </div>
            <div className="flex items-center gap-1">
              <ThemeSwitcher />
              <button
                onClick={() => onOpenChange(false)}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="h-px bg-white/10 mx-3" />

          {/* Nav items */}
          <nav
            className="flex-1 overflow-y-auto py-2 px-2"
            aria-label="Menu utama"
          >
            <ul className="space-y-0.5" role="list">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3.5 py-3 rounded-xl text-[15px] font-medium transition-all",
                          isActive
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                            : "text-emerald-50/90 hover:bg-white/5",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={cn(
                              "w-5 h-5 shrink-0",
                              isActive ? "text-white" : "text-emerald-300",
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.label}</span>
                          {isActive && <span className="sr-only"> (halaman aktif)</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      )}

      {/* Floating scroll-to-top (visible when drawer open & scrolled) */}
      {open && showScrollTop && (
        <button
          onClick={handleScrollTop}
          className="fixed bottom-24 right-4 z-[95] w-12 h-12 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Scroll ke atas"
        >
          <ArrowUp className="w-5 h-5 text-foreground" />
        </button>
      )}
    </>
  );
}