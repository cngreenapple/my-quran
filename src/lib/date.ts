/**
 * Date utilities (minimal version)
 * Catatan: versi ini TIDAK punya Hijri conversion.
 * Untuk Hijri, pakai @/lib/hijri-calendar.ts.
 */

export function getDateKey(date: Date | number = new Date()): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function isSameDay(t1: number | Date, t2: number | Date): boolean {
  return getDateKey(t1) === getDateKey(t2);
}