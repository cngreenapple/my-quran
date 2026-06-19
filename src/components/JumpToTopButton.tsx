300px. Click smooth scroll ke top. Z-index 30 fixed bottom-24 right-4.">
import { ArrowUp } from "lucide-react";
import { useScrollVisibility } from "@/hooks/use-scroll";

interface JumpToTopButtonProps {
  threshold?: number;
}

/**
 * Global Jump-to-Top button.
 * Mount di AppShell sekali supaya otomatis ada di semua route.
 */
export function JumpToTopButton({ threshold = 300 }: JumpToTopButtonProps) {
  const visible = useScrollVisibility(threshold);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-4 z-30 w-11 h-11 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center hover:bg-muted active:scale-95 transition-all animate-fade-in"
      aria-label="Scroll ke atas"
    >
      <ArrowUp className="w-5 h-5 text-foreground" aria-hidden="true" />
    </button>
  );
}