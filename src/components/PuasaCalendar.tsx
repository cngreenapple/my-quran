import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Moon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { gregorianMonthInfo, getHijriMonthInfo } from "@/lib/kalender-helpers";
import { gregorianToJDN, jdnToHijri, INDONESIAN_WEEKDAYS_SHORT, HIJRI_MONTH_NAMES, GREGORIAN_MONTH_NAMES } from "@/lib/date";

/** Jenis puasa yang bisa di-mark di kalender */
interface FastingMarker {
  date: Date; // Tanggal Gregorian
  type: "weekly" | "ayyamul-bidh" | "yearly";
  label: string;
  color: string;
}

/**
 * PuasaCalendar — Kalender interaktif untuk penjadwalan puasa sunnah.
 *
 * Fitur:
 * - Kalender bulan Masehi + tanggal Hijriah
 * - Tanda untuk hari puasa:
 *   - 🟢 Senin/Kamis
 *   - 🟡 Ayyamul Bidh (13,14,15 Hijriah)
 *   - 🔴 Puasa tahunan (Arafah, Asyura, dll)
 * - Navigasi prev/next bulan
 * - Legenda warna
 * - Scroll ke hari ini otomatis
 */
export function PuasaCalendar() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthInfo = useMemo(() => gregorianMonthInfo(year, month), [year, month]);

  // Hitung semua marker puasa untuk bulan ini
  const fastingMarkers = useMemo<FastingMarker[]>(() => {
    const markers: FastingMarker[] = [];

    for (let day = 1; day <= monthInfo.daysInMonth; day++) {
      const date = new Date(year, month, day);
      const jdn = gregorianToJDN(year, month + 1, day);
      const hijri = jdnToHijri(jdn);
      const weekday = date.getDay(); // 0=Minggu, 1=Senin, ...

      // 1. Senin & Kamis
      if (weekday === 1 || weekday === 4) {
        markers.push({ date, type: "weekly", label: "Sn/Km", color: "emerald" });
      }

      // 2. Ayyamul Bidh (13, 14, 15 Hijriah)
      if (hijri.day === 13 || hijri.day === 14 || hijri.day === 15) {
        markers.push({ date, type: "ayyamul-bidh", label: "Ayyamul Bidh", color: "amber" });
      }

      // 3. Puasa tahunan
      if (hijri.month === 12 && hijri.day === 9) { // 9 Dzulhijjah = Arafah
        markers.push({ date, type: "yearly", label: "Arafah", color: "rose" });
      }
      if (hijri.month === 1 && hijri.day === 9) { // 9 Muharram = Tasu'a
        markers.push({ date, type: "yearly", label: "Tasu'a", color: "sky" });
      }
      if (hijri.month === 1 && hijri.day === 10) { // 10 Muharram = Asyura
        markers.push({ date, type: "yearly", label: "Asyura", color: "violet" });
      }
      if (hijri.month === 10 && hijri.day >= 1 && hijri.day <= 6) { // 1-6 Syawal
        markers.push({ date, type: "yearly", label: "Syawal", color: "emerald" });
      }
    }

    return markers;
  }, [year, month, monthInfo.daysInMonth]);

  // Himpun marker per tanggal untuk lookup O(1)
  const markersByDate = useMemo(() => {
    const map = new Map<string, FastingMarker[]>();
    for (const marker of fastingMarkers) {
      const key = `${marker.date.getFullYear()}-${marker.date.getMonth()}-${marker.date.getDate()}`;
      const existing = map.get(key) || [];
      existing.push(marker);
      map.set(key, existing);
    }
    return map;
  }, [fastingMarkers]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  // Cek apakah hari ini ada di bulan yang tampil
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  // Grid: 6 minggu x 7 hari = 42 sel
  const grid: Array<{ day: number | null; isToday: boolean; isCurrentMonth: boolean; markers: FastingMarker[] }> = [];
  const startOffset = monthInfo.startWeekday;
  const totalCells = Math.ceil((startOffset + monthInfo.daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    const isValid = dayNum >= 1 && dayNum <= monthInfo.daysInMonth;
    const date = isValid ? new Date(year, month, dayNum) : null;
    const key = date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : "";
    const isToday = isValid && date?.toDateString() === today.toDateString();
    grid.push({
      day: isValid ? dayNum : null,
      isToday: isToday && isCurrentMonth,
      isCurrentMonth: isValid,
      markers: key ? markersByDate.get(key) || [] : [],
    });
  }

  const LEGEND = [
    { color: "bg-emerald-400", label: "Senin/Kamis" },
    { color: "bg-amber-400", label: "Ayyamul Bidh" },
    { color: "bg-rose-400", label: "Arafah" },
    { color: "bg-violet-400", label: "Asyura/Tasu'a" },
    { color: "bg-sky-400", label: "Syawal" },
  ];

  const hijriMonthInfo = useMemo(() => {
    const jdn = gregorianToJDN(year, month + 1, 1);
    const hijri = jdnToHijri(jdn);
    return hijri;
  }, [year, month]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500/8 via-violet-500/3 to-transparent px-4 py-3 border-b border-border/40">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            <p className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Kalender Puasa Sunnah
            </p>
          </div>
          <button
            onClick={goToday}
            className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-400 hover:bg-violet-500/20 transition-colors"
          >
            Hari Ini
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-full h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors" aria-label="Bulan sebelumnya">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">
              {GREGORIAN_MONTH_NAMES[month]} {year}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {HIJRI_MONTH_NAMES[hijriMonthInfo.month - 1]} {hijriMonthInfo.year} H
            </p>
          </div>
          <button onClick={nextMonth} className="rounded-full h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors" aria-label="Bulan berikutnya">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-3">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {INDONESIAN_WEEKDAYS_SHORT.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {grid.map((cell, idx) => {
            const isWeekly = cell.markers.some((m) => m.type === "weekly");
            const isAyyamul = cell.markers.some((m) => m.type === "ayyamul-bidh");
            const isYearly = cell.markers.some((m) => m.type === "yearly");
            const hasMarker = cell.markers.length > 0;
            const dotColor = isYearly ? "bg-rose-400" : isAyyamul ? "bg-amber-400" : "bg-emerald-400";

            return (
              <div key={idx} className="aspect-square flex flex-col items-center justify-center relative">
                {cell.day ? (
                  <>
                    <div
                      className={cn(
                        "w-full h-full rounded-lg flex flex-col items-center justify-center relative text-xs font-medium transition-colors",
                        cell.isToday && "ring-2 ring-violet-500/50 bg-violet-500/10",
                        hasMarker && !cell.isToday && "bg-muted/30",
                      )}
                    >
                      <span
                        className={cn(
                          "tabular-nums",
                          cell.isToday ? "text-violet-700 dark:text-violet-400 font-bold" : "text-foreground",
                          !cell.isCurrentMonth && "text-muted-foreground/40",
                        )}
                      >
                        {cell.day}
                      </span>
                      {/* Dot indicator untuk puasa */}
                      {hasMarker && (
                        <div className="flex gap-0.5 mt-0.5">
                          <span className={cn("w-1 h-1 rounded-full", dotColor)} />
                        </div>
                      )}
                    </div>
                    {/* Label tooltip untuk hari puasa */}
                    {hasMarker && (
                      <div className="hidden group-hover:block absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-popover text-popover-foreground text-[8px] px-1.5 py-0.5 rounded shadow-lg z-10">
                        {cell.markers.map((m) => m.label).join(" + ")}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Info className="w-3 h-3" aria-hidden="true" />
          Legenda
        </p>
        <div className="flex flex-wrap gap-2">
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <span className={cn("w-2 h-2 rounded-full", item.color)} />
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}