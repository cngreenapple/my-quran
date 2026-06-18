import { NavLink, useLocation } from "react-router-dom";
import {
  Home, Bookmark, StickyNote, Clock, Star, BookHeart, Hand,
  Compass, Moon, Video, Info, X, ArrowUp, Settings,
} from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
};

const PRIMARY: NavItem[] = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/bookmark", label: "Bookmark", icon: Bookmark },
  { to: "/catatan", label: "Catatan", icon: StickyNote },
];

const IBADAH: NavItem[] = [
  { to: "/jadwal-sholat", label: "Jadwal Sholat", icon: Clock },
  { to: "/arah-kiblat", label: "Arah Kiblat", icon: Compass },
  { to: "/dzikir", label: "Dzikir", icon: BookHeart },
  { to: "/doa", label: "Doa", icon: Hand },
];

const KONTEN: NavItem[] = [
  { to: "/asmaul-husna", label: "Asmaul Husna", icon: Star },
  { to: "/puasa-sunnah", label: "Puasa Sunnah", icon: Moon },
  { to: "/live-makkah", label: "Live Makkah", icon: Video },
];

const LAINNYA: NavItem[] = [
  { to: "/settings", label: "Pengaturan", icon: Settings },
  { to: "/tentang", label: "Tentang", icon: Info },
];

const SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  { title: "Pribadi", items: PRIMARY },
  { title: "Ibadah", items: IBADAH },
  { title: "Konten", items: KONTEN },
  { title: "Lainnya", items: LAINNYA },
];

export function AppDrawer({ open, onOpenChange }: AppDrawerProps) {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else if (mounted) {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 320);
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

  useEffect(() => { onOpenChange(false); /* eslint-disable-next-line */ }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleScrollTop = () => {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
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

      {mounted && (
        <aside
          className={cn(
            "fixed top-0 left-0 bottom-0 z-[90] w-[280px] sm:w-[300px] bg-[#0f2319] text-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
            visible ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/30"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M12 2 L20 10 L12 18 L4 10 Z" opacity="0.9" />
                  <path d="M12 6 L16 10 L12 14 L8 10 Z" opacity="0.7" />
                  <path d="M12 10 L13.5 11.5 L12 13 L10.5 11.5 Z" />
                </svg>
              </div>
              <div className="leading-none">
                <p className="text-sm font-bold tracking-tight">Al-Quran</p>
                <p className="text-[10px] text-emerald-200/70 font-medium">Digital Indonesia</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeSwitcher />
              <button
                onClick={() => onOpenChange(false)}
                className="icon-btn h-9 w-9 text-white hover:bg-white/10"
                aria-label="Tutup menu"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="h-px bg-white/10 mx-3" />

          <nav className="flex-1 overflow-y-auto py-2 px-2" aria-label="Menu utama">
            {SECTIONS.map((section) => (
              <div key={section.title} className="mb-1">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
                  {section.title}
                </p>
                <ul className="space-y-0.5" role="list">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium transition-all",
                              isActive
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                                : "text-emerald-50/90 hover:bg-white/5",
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon
                                className={cn(
                                  "w-[18px] h-[18px] shrink-0",
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
              </div>
            ))}
          </nav>
        </aside>
      )}

      {open && showScrollTop && (
        <button
          onClick={handleScrollTop}
          className="fixed bottom-24 right-4 z-[95] w-11 h-11 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Scroll ke atas"
        >
          <ArrowUp className="w-5 h-5 text-foreground" />
        </button>
      )}
    </>
  );
}