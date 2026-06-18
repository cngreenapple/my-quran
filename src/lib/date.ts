/**
 * Date utilities — reusable across hooks dan lib.
 * Pakai local date (bukan UTC) supaya match dengan hari user.
 */

/**
 * Get YYYY-MM-DD date key dari Date/timestamp.
 * Pakai local date components untuk konsistensi dengan user timezone.
 */
export function getDateKey(date: Date | number = new Date()): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Hitung jumlah hari antara 2 date strings (YYYY-MM-DD).
 * Positive = date2 setelah date1, negative = sebaliknya.
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Cek apakah 2 timestamps di hari yang sama (local time).
 */
export function isSameDay(t1: number | Date, t2: number | Date): boolean {
  return getDateKey(t1) === getDateKey(t2);
}