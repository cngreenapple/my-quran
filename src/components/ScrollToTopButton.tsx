import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * ScrollToTopButton — tombol fixed di pojok kanan bawah
 * untuk scroll ke atas halaman dengan smooth animation.
 *
 * - Muncul saat user scroll > 300px dari atas
 * - Fade in/out animation
 * - Smooth scroll to top saat diklik
 * - Aksesibel dengan ARIA label
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    // Check initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "fixed bottom-24 right-4 z-50 rounded-full shadow-lg transition-all duration-300 ease-in-out",
        "hover:scale-110 active:scale-95",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
}