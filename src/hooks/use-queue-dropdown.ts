import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseQueueDropdownOptions {
  totalItems: number;
  items: Array<{ isCurrent: boolean; [key: string]: unknown }>;
  filterFn?: (item: { isCurrent: boolean; [key: string]: unknown }, query: string) => boolean;
  /** Default: 288 */
  width?: number;
  /** Jarak vertikal dari trigger ke dropdown (default 8) */
  offset?: number;
  /** Jarak minimum dari tepi viewport (default 8) */
  edgeMargin?: number;
  /** Tinggi minimum yang harus tersedia di posisi "bawah" sebelum flip ke "atas" (default 200) */
  minSpaceBelow?: number;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  /** "below" = dropdown di bawah trigger, "above" = di atas trigger */
  placement: "below" | "above";
}

interface UseQueueDropdownReturn<T> {
  open: boolean;
  toggle: () => void;
  close: () => void;
  openDropdown: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  listRef: React.RefObject<HTMLDivElement>;
  position: DropdownPosition;
  search: string;
  setSearch: (s: string) => void;
  filteredItems: T[];
  totalItems: number;
}

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
    minSpaceBelow = 200,
  } = options;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width,
    placement: "below",
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /**
   * Hitung posisi dropdown dengan smart placement:
   *
   * Logic "below" vs "above":
   * 1. Hitung available space di bawah trigger = viewport.height - trigger.bottom
   * 2. Hitung available space di atas trigger = trigger.top
   * 3. Kalau space di bawah < minSpaceBelow AND space di atas > space di bawah
   *    → flip ke "above" (tempatkan di atas trigger)
   * 4. Else: gunakan "below" (default, paling natural)
   *
   * Logic horizontal:
   * - Left-anchor ke trigger.right (right-aligned)
   * - Kalau overflow ke kanan, shift ke kiri
   * - Kalau masih overflow ke kiri, clamp ke edgeMargin
   */
  const computePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const dropdownWidth = Math.min(width, viewportWidth - edgeMargin * 2);
    const spaceBelow = viewportHeight - rect.bottom - offset - edgeMargin;
    const spaceAbove = rect.top - offset - edgeMargin;

    // Default dropdown height (akan di-clamp di JSX dengan maxHeight CSS)
    const preferredHeight = Math.min(480, 0.6 * viewportHeight);

    let placement: "below" | "above" = "below";
    let top: number;

    if (spaceBelow < Math.min(minSpaceBelow, preferredHeight) && spaceAbove > spaceBelow) {
      // Flip ke atas
      placement = "above";
      const height = Math.min(preferredHeight, spaceAbove);
      top = rect.top - offset - height;
    } else {
      // Default: di bawah
      placement = "below";
      top = rect.bottom + offset;
    }

    // Horizontal: right-align ke trigger, clamp ke viewport
    let left = rect.right - dropdownWidth;
    if (left < edgeMargin) left = edgeMargin;
    if (left + dropdownWidth > viewportWidth - edgeMargin) {
      left = viewportWidth - dropdownWidth - edgeMargin;
    }

    setPosition({ top, left, width: dropdownWidth, placement });
  }, [width, offset, edgeMargin, minSpaceBelow]);

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

  // Close on outside click & Escape
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

  // Auto-scroll current item ke tengah list saat dropdown buka
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
      const offsetFromTop = itemRect.top - listRect.top;
      const targetScroll =
        list.scrollTop +
        offsetFromTop -
        listRect.height / 2 +
        itemRect.height / 2;
      list.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    });
  }, [open]);

  // Reposition on scroll/resize (kalau trigger move relatif ke viewport)
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
    totalItems,
  };
}