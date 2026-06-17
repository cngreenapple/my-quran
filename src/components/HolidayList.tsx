import { memo } from "react";
import { Calendar, PartyPopper, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UpcomingEvent } from "@/types/hijri-calendar";
import { formatFullDate } from "@/lib/hijri-calendar";

interface HolidayListProps {
  events: UpcomingEvent[];
  showGreeting?: boolean;
}

const colorClasses = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
  },
  sky: {
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    text: "text-sky-600 dark:text-sky-400",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    text: "text-violet-600 dark:text-violet-400",
  },
};

function HolidayListComponent({ events, showGreeting = false }: HolidayListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Tidak ada hari besar dalam 90 hari ke depan
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {events.map((event) => {
        const colors = colorClasses[event.holiday.color];
        const isToday = event.daysUntil === 0;
        const isSoon = event.daysUntil <= 7;

        return (
          <Card
            key={`${event.holiday.id}-${event.gregorianDate.getTime()}`}
            className={cn(
              "border-border/60 overflow-hidden",
              isToday && `${colors.border} ring-2 ring-offset-2 ring-offset-background`,
            )}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                {/* Emoji */}
                <div
                  className={cn(
                    "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0",
                    colors.bg,
                  )}
                >
                  {event.holiday.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {event.holiday.name}
                      </h3>
                      <p
                        className="font-arabic text-xs text-muted-foreground"
                        dir="rtl"
                      >
                        {event.holiday.nameArabic}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "shrink-0 text-right",
                        isToday ? colors.text : "text-muted-foreground",
                      )}
                    >
                      <p
                        className={cn(
                          "text-lg font-bold tabular-nums leading-none",
                          isToday && "animate-pulse",
                        )}
                      >
                        {isToday ? "HARI INI" : `H-${event.daysUntil}`}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider mt-0.5 font-medium">
                        {isToday ? "Dirayakan" : "hari lagi"}
                      </p>
                    </div>
                  </div>

                  {/* Date labels */}
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatFullDate(event.gregorianDate).split(", ")[1]}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <span className={colors.text}>{event.hijriLabel}</span>
                  </div>

                  {/* Greeting for today */}
                  {showGreeting && isToday && event.holiday.greeting && (
                    <div
                      className={cn(
                        "mt-2.5 rounded-xl px-3 py-2 text-xs leading-relaxed font-medium",
                        colors.bg,
                        colors.text,
                      )}
                    >
                      <p className="flex items-start gap-1.5">
                        <Heart className="w-3 h-3 mt-0.5 shrink-0 fill-current" />
                        <span>{event.holiday.greeting}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const HolidayList = memo(HolidayListComponent);