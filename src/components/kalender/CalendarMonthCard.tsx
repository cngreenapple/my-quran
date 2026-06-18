import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IslamicHoliday } from "@/data/islamic-holidays";

interface CalendarMonthCardProps {
  header: React.ReactNode;
  /** Content biasanya berisi WeekdayRow + grid DayCell */
  children: React.ReactNode;
  /** Optional: informasi highlight di bawah grid (mis. '1 event bulan ini') */
  footer?: React.ReactNode;
  className?: string;
  holidayCount?: number;
  holidaysInMonth?: IslamicHoliday[];
}

export function CalendarMonthCard({
  header,
  children,
  footer,
  className,
  holidayCount,
  holidaysInMonth,
}: CalendarMonthCardProps) {
  return (
    <Card className={cn("border-border/60 overflow-hidden", className)}>
      <CardContent className="p-3.5">
        {header}
        {children}
        {footer}
        {holidayCount !== undefined && holidaysInMonth && holidayCount > 0 && (
          <div className="mt-2 pt-2 border-t border-border/40 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {holidayCount} hari besar
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}