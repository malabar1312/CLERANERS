import { describe, it, expect } from "vitest";
import {
  analyzeSupply,
  simulateDemand,
  detectImbalances,
  computeMarketHealth,
  AMSTERDAM_DEMAND_MODEL,
  type SupplyInput,
} from "../health";

const sample: SupplyInput[] = [
  { hood: "De Pijp", pricePerHour: 24 },
  { hood: "De Pijp", pricePerHour: 26 },
  { hood: "Centrum", pricePerHour: 20 },
  { hood: "Noord", pricePerHour: 22 },
];

describe("analyzeSupply", () => {
  it("aggregates cleaners per hood with avg price", () => {
    const r = analyzeSupply(sample);
    const pijp = r.find((s) => s.hood === "De Pijp");
    expect(pijp?.cleaners).toBe(2);
    expect(pijp?.avgPrice).toBe(25);
  });

  it("sorts by cleaner count desc", () => {
    expect(analyzeSupply(sample)[0]?.hood).toBe("De Pijp");
  });

  it("handles empty supply", () => {
    expect(analyzeSupply([])).toEqual([]);
  });
});

describe("simulateDemand", () => {
  it("uses model weights when no real data", () => {
    const d = simulateDemand();
    expect(d.every((x) => x.source === "simulated")).toBe(true);
    expect(d.length).toBe(Object.keys(AMSTERDAM_DEMAND_MODEL).length);
  });

  it("prefers real data when provided", () => {
    const d = simulateDemand({ Centrum: 50 });
    const centrum = d.find((x) => x.hood === "Centrum");
    expect(centrum?.source).toBe("real");
    expect(centrum?.weight).toBe(50);
  });
});

describe("detectImbalances", () => {
  it("flags uncovered hoods (demand, 0 supply)", () => {
    const supply = analyzeSupply(sample);
    const demand = simulateDemand();
    const imb = detectImbalances(supply, demand);
    const zuid = imb.find((i) => i.hood === "Zuid");
    expect(zuid?.state).toBe("uncovered"); // Zuid has demand in model, 0 cleaners
  });

  it("flags shortage when demand-per-cleaner is high", () => {
    // Centrum: weight 95, 1 cleaner → ratio 95 > 45 → shortage
    const supply = analyzeSupply(sample);
    const demand = simulateDemand();
    const centrum = detectImbalances(supply, demand).find((i) => i.hood === "Centrum");
    expect(centrum?.state).toBe("shortage");
  });
});

describe("computeMarketHealth", () => {
  it("classifies EARLY STAGE when demand is all simulated", () => {
    const h = computeMarketHealth(sample);
    expect(h.simulated).toBe(true);
    expect(h.classification).toBe("EARLY STAGE");
    expect(h.demandScore).toBeLessThan(30);
  });

  it("returns coherent scores in 0-100", () => {
    const h = computeMarketHealth(sample);
    for (const s of [h.supplyScore, h.demandScore, h.balanceScore, h.overall]) {
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  it("counts total cleaners and uncovered hoods", () => {
    const h = computeMarketHealth(sample);
    expect(h.totalCleaners).toBe(4);
    expect(h.uncoveredHoods).toContain("Zuid");
  });

  it("improves demandScore as real data arrives", () => {
    const sim = computeMarketHealth(sample);
    const real = computeMarketHealth(sample, {
      Centrum: 40, "De Pijp": 50, Zuid: 30, Jordaan: 20, "Oud-West": 25,
      Oost: 30, West: 20, Noord: 15, "Nieuw-West": 10, Zuidoost: 10, Westpoort: 5,
    });
    expect(real.demandScore).toBeGreaterThan(sim.demandScore);
  });
});
