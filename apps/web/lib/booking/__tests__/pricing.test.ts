import { describe, it, expect } from "vitest";
import { hoursForArea, computePrice, formatEur, minBookingDate, SERVICE_FEE_PCT } from "../pricing";

describe("hoursForArea", () => {
  it("maps ≤50 m² to 2 hours", () => {
    expect(hoursForArea(30)).toBe(2);
    expect(hoursForArea(50)).toBe(2);
  });

  it("maps 51-80 m² to 3 hours", () => {
    expect(hoursForArea(51)).toBe(3);
    expect(hoursForArea(80)).toBe(3);
  });

  it("maps 81-120 m² to 4 hours", () => {
    expect(hoursForArea(100)).toBe(4);
    expect(hoursForArea(120)).toBe(4);
  });

  it("maps 120+ m² to 5 hours", () => {
    expect(hoursForArea(121)).toBe(5);
    expect(hoursForArea(200)).toBe(5);
  });
});

describe("computePrice", () => {
  it("computes correctly for €24/h, 70m² (the canonical example)", () => {
    const p = computePrice(24, 70);
    expect(p.hours).toBe(3);
    expect(p.subtotalCents).toBe(7200); // 3 × €24 = €72
    expect(p.feeCents).toBe(1296); // 18% of €72 = €12.96
    expect(p.totalCents).toBe(8496); // €84.96
    expect(p.feePct).toBe(SERVICE_FEE_PCT);
  });

  it("uses integer cents (no floating point drift)", () => {
    const p = computePrice(23, 55);
    expect(Number.isInteger(p.subtotalCents)).toBe(true);
    expect(Number.isInteger(p.feeCents)).toBe(true);
    expect(Number.isInteger(p.totalCents)).toBe(true);
    expect(p.totalCents).toBe(p.subtotalCents + p.feeCents);
  });
});

describe("formatEur", () => {
  it("formats cents as NL euro string", () => {
    const s = formatEur(8496);
    expect(s).toContain("84");
    expect(s).toContain("96");
    expect(s).toContain("€");
  });
});

describe("minBookingDate", () => {
  it("returns tomorrow's date", () => {
    const now = new Date("2026-06-06T12:00:00");
    expect(minBookingDate(now)).toBe("2026-06-07");
  });
});
