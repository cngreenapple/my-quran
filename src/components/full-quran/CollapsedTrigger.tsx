import { ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CollapsedTriggerProps {
  onClick: () => void;
  className?: string;
}

export function CollapsedTrigger({ onClick, className }: CollapsedTriggerProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "rounded-full gap-1.5 h-8 text-xs font-semibold",
        "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10",
        className,
      )}
      aria-label="Buka mode baca Al-Qur'an full"
    >
      <ListMusic className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Baca Full</span>
    </Button>
  );
}