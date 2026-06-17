import { Link, NavLink, useLocation } from "react-router-dom";
import { BookOpen, Bookmark, Home, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./ThemeSwitcher";

const navItems = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/bookmark", label: "Bookmark", icon: Bookmark },
  { to: "/settings", label: "Pengaturan", icon: SettingsIcon },
];

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 max-w-5xl">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
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

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl pb-safe">
      <div className="grid grid-cols-3 gap-1 p-2 max-w-md mx-auto">
        {navItems.map((item) => {
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
                "flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground active:scale-95",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110",
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide",
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