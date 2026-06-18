import { describe, it, expect } from "vitest";
import { formatFullDate, getTodayInfo, gregorianToHijri } from "@/lib/hijri";

describe("formatFullDate", () => {
  it("formats Indonesian full date", () => {
    // 2025-01-15 is a Wednesday
    const result = formatFullDate(new Date(2025, 0, 15));
    expect(result).toBe("Rabu, 15 Januari 2025");
  });

  it("handles different months", () => {
    expect(formatFullDate(new Date(2025, 11, 25))).toContain("Desember");
    expect(formatFullDate(new Date(2025, 6, 17))).toContain("Juli");
  });
});

describe("getTodayInfo", () => {
  it("returns both Gregorian and Hijri info", () => {
    const info = getTodayInfo(new Date(2025, 5, 15));
    expect(info.gregorian.weekday).toBeTruthy();
    expect(info.hijri.day).toBeGreaterThan(0);
    expect(info.hijri.month).toBeGreaterThan(0);
    expect(info.hijri.month).toBeLessThanOrEqual(12);
  });
});

describe("gregorianToHijri", () => {
  it("returns valid Hijri date components", () => {
    const result = gregorianToHijri(new Date(2025, 0, 1));
    expect(result.day).toBeGreaterThan(0);
    expect(result.day).toBeLessThanOrEqual(30);
    expect(result.month).toBeGreaterThan(0);
    expect(result.month).toBeLessThanOrEqual(12);
    expect(result.year).toBeGreaterThan(1400);
    expect(result.monthName).toBeTruthy();
    expect(result.monthArabic).toBeTruthy();
  });
});