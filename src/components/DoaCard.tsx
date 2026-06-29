import { memo, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DoaItem } from "@/types/dzikir";

interface DoaCardProps {
  doa: DoaItem;
}

export const DoaCard = memo(function DoaCard({ doa }: DoaCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="p-4 sm:p-5 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-foreground">{doa.title}</h3>

        {/* Arabic */}
        <p
          className="font-arabic text-right text-xl sm:text-2xl leading-[2.2] text-foreground"
          dir="rtl"
          lang="ar"
        >
          {doa.arabic}
        </p>

        {/* Latin */}
        <p className="text-sm italic text-primary/80 dark:text-primary/90 leading-relaxed">
          {doa.latin}
        </p>

        {/* Translation */}
        <p className="text-sm text-foreground/80 leading-relaxed">
          {doa.translation}
        </p>

        {/* Catatan (expandable) */}
        {doa.catatan && (
          <div>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              aria-expanded={expanded}
              aria-label={expanded ? "Sembunyikan catatan" : "Tampilkan catatan"}
            >
              <Info className="w-3 h-3" aria-hidden="true" />
              Keterangan & Sumber
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform",
                  expanded && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            {expanded && (
              <div className="mt-2 p-3 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-foreground/85 leading-relaxed whitespace-pre-line animate-fade-in">
                {doa.catatan}
              </div>
            )}
          </div>
        )}

        {/* Source (jika tidak ada catatan, tampilkan source langsung) */}
        {!doa.catatan && doa.source && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            <Info className="w-3 h-3" aria-hidden="true" />
            <span>{doa.source}</span>
          </div>
        )}
      </div>
    </div>
  );
});