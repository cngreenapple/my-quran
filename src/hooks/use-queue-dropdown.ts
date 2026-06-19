import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseQueueDropdownOptions {
  /** Total items in queue (untuk "X surah" di header) */
  totalItems: number;
  /** Items dengan isCurrent flag (untuk highlight + auto-scroll) */
  items: Array<{ isCurrent: boolean; [key: string]: unknown }>;
  /** Optional search filter — return true kalau item match query */
  filterFn?: (item: { isCurrent: boolean; [key: string]: unknown }, query: string) => boolean;
  /** Dropdown width, default 288px (w-72) */
  width?: number;
  /** Offset dari trigger button ke dropdown, default 8px */
  offset?: number;
  /** Margin dari viewport edge, default 8px */
  edgeMargin?: number;
}

interface UseQueueDropdownReturn<T> {
  open: boolean;
  toggle: () => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  listRef: React.RefObject<HTMLDivElement>;
  position: { top: number; left: number; width: number };
  search: string;
  setSearch: (s: string) => void;
  filteredItems: T[];
}

/**
 * Hook untuk manage portal-based dropdown list.
 *
 * Concerns yang di-handle:
 * - Open/close state
 * - Anchor positioning (di bawah trigger, align kanan)
 * - Viewport collision detection (geser kalau overflow)
 * - Outside click + Escape key untuk close
 * - Search filter
 * - Auto-scroll ke current item saat dibuka
 * - Reposition on window resize/scroll
 *
 * Component consumer tidak perlu pusing dengan positioning math.
 */
export function useQueueDropdown<T extends { isCurrent: boolean }>(
  options: UseQueueDropdownOptions,
): UseQueueDropdownReturn<T> {
  const {
    totalItems,
    items,
    filterFn,
    width = 288,
    offset = 8,
    edgeMargin = 8,
  } = options;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /**
   * Hitung posisi dropdown berdasar trigger button location.
   * Anchor: di bawah trigger, align kanan (right edge of trigger = right edge of dropdown).
   * Collision: kalau overflow ke kiri, geser ke kanan; kalau overflow ke kanan, geser ke kiri.
   */
  const computePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const dropdownWidth = Math.min(width, window.innerWidth - edgeMargin * 2);
    let left = rect.right - dropdownWidth;
    if (left < edgeMargin) left = edgeMargin;
    if (left + dropdownWidth > window.innerWidth - edgeMargin) {
      left = window.innerWidth - dropdownWidth - edgeMargin;
    }
    setPosition({ top: rect.bottom + offset, left, width: dropdownWidth });
  }, [width, offset, edgeMargin]);

  const openDropdown = useCallback(() => {
    if (!open) computePosition();
    setOpen(true);
  }, [open, computePosition]);

  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false);
    } else {
      computePosition();
      setOpen(true);
    }
  }, [open, computePosition]);

  // Outside click + Escape handler
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (triggerRef.current?.contains(target)) return;
      if (target.closest("[data-queue-dropdown]")) return;
      setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  /**
   * Auto-scroll ke current item saat dropdown dibuka.
   * Pakai manual scrollTop calculation supaya tidak ikut scroll page —
   * hanya scroll dalam list container (listRef).
   */
  useEffect(() => {
    if (!open) return;
    setSearch("");
    requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list) return;
      const currentEl = list.querySelector(
        '[data-current="true"]',
      ) as HTMLElement | null;
      if (!currentEl) return;
      const listRect = list.getBoundingClientRect();
      const itemRect = currentEl.getBoundingClientRect();
      const offset = itemRect.top - listRect.top;
      const targetScroll =
        list.scrollTop +
        offset -
        listRect.height / 2 +
        itemRect.height / 2;
      list.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    });
  }, [open]);

  // Reposition saat window resize/scroll
  useEffect(() => {
    if (!open) return;
    const handleReposition = () => computePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, computePosition]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!filterFn) return items as T[];
    const q = search.trim();
    if (!q) return items as T[];
    return (items as T[]).filter((item) => filterFn(item, q.toLowerCase()));
  }, [items, search, filterFn]);

  return {
    open,
    toggle,
    close,
    openDropdown,
    triggerRef,
    listRef,
    position,
    search,
    setSearch,
    filteredItems,
    /**
     * Exposed untuk consumers yang butuh total count
     * (biasanya untuk display "X surah" di header dropdown).
     */
    totalItems,
  };
}