import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ISLAMIC_HOLIDAYS,
  type IslamicHoliday,
  type HolidayType,
  HOLIDAY_TYPE_LABELS,
} from "@/data/islamic-holidays";
import { cn } from "@/lib/utils";
import { colorClasses, HIJRI_MONTH_NAMES_ID } from "./constants";

export function HolidaysTable() {
  const [filter, setFilter] = useState<HolidayType | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return ISLAMIC_HOLIDAYS;
    return ISLAMIC_HOLIDAYS.filter((h) => h.type === filter);
  }, [filter]);

  const grouped = useMemo(() => {
    const map = new Map<number, IslamicHoliday[]>();
    filtered.forEach((h) => {
      if (!map.has(h.hijriMonth)) map.set(h.hijriMonth, []);
      map.get(h.hijriMonth)!.push(h);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  return (
    <div className="space-y-3">
      <HolidaysTableFilter filter={filter} onFilterChange={setFilter} />

      {grouped.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Tidak ada hari besar untuk filter ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([month, holidays]) => (
            <HolidaysMonthGroup
              key={month}
              month={month}
              holidays={holidays}
            />
          ))}
        </div>
      )}

      <HolidaysTableFooter />
    </div>
  );
}

// --- Sub-komponen ---

interface HolidaysTableFilterProps {
  filter: HolidayType | "all";
  onFilterChange: (filter: HolidayType | "all") => void;
}

function HolidaysTableFilter({ filter, onFilterChange }: HolidaysTableFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
      <Button
        variant={filter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
        className="rounded-full h-7 text-xs shrink-0"
      >
        ✨ Semua
      </Button>
      {(Object.keys(HOLIDAY_TYPE_LABELS) as HolidayType[]).map((t) => {
        const info = HOLIDAY_TYPE_LABELS[t];
        return (
          <Button
            key={t}
            variant={filter === t ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(t)}
            className="rounded-full h-7 text-xs shrink-0"
          >
            {info.emoji} {info.label}
          </Button>
        );
      })}
    </div>
  );
}

interface HolidaysMonthGroupProps {
  month: number;
  holidays: IslamicHoliday[];
}

function HolidaysMonthGroup({ month, holidays }: HolidaysMonthGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Bulan {HIJRI_MONTH_NAMES_ID[month]}
        </p>
        <div className="flex-1 h-px bg-border/60" />
        <p className="text-[10px] text-muted-foreground tabular-nums">
          {holidays.length} hari
        </p>
      </div>

      <Card className="border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-2.5 py-2 text-left text-[9px] font-bold text-muted-foreground uppercase tracking-wider w-12">
                  Tanggal
                </th>
                <th className="px-2.5 py-2 text-left text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  Hari Besar
                </th>
                <th className="px-2.5 py-2 text-left text-[9px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell w-32">
                  Tipe
                </th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <HolidayRow key={h.id} holiday={h} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function HolidayRow({ holiday: h }: { holiday: IslamicHoliday }) {
  const c = colorClasses[h.color];
  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-2.5 py-2.5 align-top">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-base font-bold text-foreground tabular-nums leading-none">
            {h.hijriDay}
          </span>
          <span className="text-[9px] text-muted-foreground font-medium uppercase">
            {HIJRI_MONTH_NAMES_ID[h.hijriMonth].slice(0, 3)}
          </span>
        </div>
      </td>
      <td className="px-2.5 py-2.5 align-top">
        <div className="flex items-start gap-2">
          <span className="text-base shrink-0" aria-hidden="true">
            {h.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground leading-tight">{h.name}</p>
            <p
              className="font-arabic text-[10px] text-muted-foreground leading-tight"
              dir="rtl"
              lang="ar"
            >
              {h.nameArabic}
            </p>
            <p className="text-[10px] text-foreground/75 leading-relaxed mt-1 line-clamp-3">
              {h.description}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2.5 py-2.5 align-top hidden sm:table-cell">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap",
            c.emojiBg,
            c.text,
          )}
        >
          {HOLIDAY_TYPE_LABELS[h.type].emoji} {HOLIDAY_TYPE_LABELS[h.type].label}
        </span>
      </td>
    </tr>
  );
}

function HolidaysTableFooter() {
  return (
    <div className="mt-3 p-3 rounded-2xl bg-muted/40 border border-border/40 flex items-start gap-2.5">
      <Info
        className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Tanggal Hijriah bersifat perkiraan berdasarkan kalender tabular. Penetapan
        resmi menunggu keputusan Kemenag berdasarkan rukyatul hilal (observasi
        bulan sabit) sehingga dapat bergeser ±1-2 hari.
      </p>
    </div>
  );
}