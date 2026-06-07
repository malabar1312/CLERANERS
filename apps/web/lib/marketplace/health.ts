/**
 * Marketplace health & simulation engine (dual-layer).
 *
 * Pure functions — no side effects, no I/O. The caller injects REAL data
 * (Supabase) or MOCK data (BETA). The simulation layer fills demand gaps when
 * real signals are insufficient, clearly flagged `source: "simulated"` so it's
 * never confused with product truth.
 *
 * Used by ops/analysis (market report, future admin view). NOT a user-facing
 * product surface.
 */

/* ─────────────────────────── Types ─────────────────────────── */

export interface SupplyInput {
  hood: string;
  pricePerHour: number;
}

export interface SupplyByHood {
  hood: string;
  cleaners: number;
  avgPrice: number;
}

export interface DemandByHood {
  hood: string;
  /** 0-100 relative demand weight. */
  weight: number;
  source: "real" | "simulated";
}

export type HoodState = "uncovered" | "shortage" | "balanced" | "surplus";

export interface HoodImbalance {
  hood: string;
  supply: number;
  demandWeight: number;
  /** demandWeight per cleaner. Higher = more under-served. */
  ratio: number;
  state: HoodState;
}

export type MarketClassification =
  | "HEALTHY MARKET"
  | "SUPPLY SHORTAGE"
  | "DEMAND SHORTAGE"
  | "EARLY STAGE";

export interface MarketHealth {
  /** 0-100 each. */
  supplyScore: number;
  demandScore: number;
  balanceScore: number;
  overall: number;
  classification: MarketClassification;
  totalCleaners: number;
  coveredHoods: number;
  uncoveredHoods: string[];
  imbalances: HoodImbalance[];
  /** True when any demand input was simulated (real data insufficient). */
  simulated: boolean;
}

/* ───────────────────── Amsterdam demand model ───────────────────── */

/**
 * Amsterdam neighborhoods with a relative cleaning-demand weight (0-100).
 * Proxy: population density × disposable income × short-stay-rental density.
 * SIMULATION ONLY — replace with real booking-attempt aggregates when volume
 * exists. Weights are intentionally coarse; precision isn't the point, relative
 * imbalance detection is.
 */
export const AMSTERDAM_DEMAND_MODEL: Record<string, number> = {
  Centrum: 95,
  "De Pijp": 90,
  Zuid: 85,
  Jordaan: 80,
  "Oud-West": 75,
  Oost: 70,
  West: 65,
  Noord: 55,
  "Nieuw-West": 50,
  Zuidoost: 45,
  Westpoort: 20,
};

/* ───────────────────────── Functions ───────────────────────── */

/** Aggregate raw cleaner rows into supply-per-hood. */
export function analyzeSupply(cleaners: SupplyInput[]): SupplyByHood[] {
  const byHood = new Map<string, { count: number; priceSum: number }>();
  for (const c of cleaners) {
    const e = byHood.get(c.hood) ?? { count: 0, priceSum: 0 };
    e.count += 1;
    e.priceSum += c.pricePerHour;
    byHood.set(c.hood, e);
  }
  return [...byHood.entries()]
    .map(([hood, e]) => ({
      hood,
      cleaners: e.count,
      avgPrice: Math.round((e.priceSum / e.count) * 100) / 100,
    }))
    .sort((a, b) => b.cleaners - a.cleaners);
}

/**
 * Demand per hood. If `realByHood` covers a hood, that's used (source "real");
 * otherwise the Amsterdam model fills it (source "simulated").
 */
export function simulateDemand(
  realByHood?: Record<string, number>,
): DemandByHood[] {
  return Object.entries(AMSTERDAM_DEMAND_MODEL).map(([hood, modelWeight]) => {
    const real = realByHood?.[hood];
    return real != null && real > 0
      ? { hood, weight: real, source: "real" as const }
      : { hood, weight: modelWeight, source: "simulated" as const };
  });
}

/**
 * Per-hood imbalance. `shortageThreshold` = demandWeight-per-cleaner above which
 * a hood is under-served. Uncovered = demand exists but 0 cleaners.
 */
export function detectImbalances(
  supply: SupplyByHood[],
  demand: DemandByHood[],
  shortageThreshold = 45,
): HoodImbalance[] {
  const supplyMap = new Map(supply.map((s) => [s.hood, s.cleaners]));
  return demand
    .map((d) => {
      const cleaners = supplyMap.get(d.hood) ?? 0;
      const ratio = cleaners === 0 ? d.weight : d.weight / cleaners;
      let state: HoodState;
      if (cleaners === 0) state = "uncovered";
      else if (ratio > shortageThreshold) state = "shortage";
      else if (ratio < shortageThreshold / 2) state = "surplus";
      else state = "balanced";
      return { hood: d.hood, supply: cleaners, demandWeight: d.weight, ratio: Math.round(ratio * 10) / 10, state };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Aggregate market health from supply + demand. */
export function computeMarketHealth(
  cleaners: SupplyInput[],
  realDemandByHood?: Record<string, number>,
): MarketHealth {
  const supply = analyzeSupply(cleaners);
  const demand = simulateDemand(realDemandByHood);
  const imbalances = detectImbalances(supply, demand);

  const totalCleaners = cleaners.length;
  const modeledHoods = demand.length;
  const coveredHoods = supply.length;
  const uncovered = imbalances.filter((i) => i.state === "uncovered").map((i) => i.hood);

  // Supply score: coverage breadth × depth. 3+ cleaners/hood and full coverage = 100.
  const coverageRatio = coveredHoods / modeledHoods;
  const depth = Math.min(1, totalCleaners / (modeledHoods * 3));
  const supplyScore = clamp(coverageRatio * 60 + depth * 40);

  // Demand score: how much demand is REAL vs simulated (real = healthier signal).
  const realCount = demand.filter((d) => d.source === "real").length;
  const demandScore = clamp((realCount / modeledHoods) * 100);

  // Balance score: penalize shortage + uncovered hoods.
  const bad = imbalances.filter((i) => i.state === "shortage" || i.state === "uncovered").length;
  const balanceScore = clamp(100 - (bad / modeledHoods) * 100);

  const overall = clamp(supplyScore * 0.4 + demandScore * 0.25 + balanceScore * 0.35);

  let classification: MarketClassification;
  if (demandScore < 30) classification = "EARLY STAGE";
  else if (balanceScore < 50 && supplyScore < 50) classification = "SUPPLY SHORTAGE";
  else if (demandScore < 50) classification = "DEMAND SHORTAGE";
  else classification = "HEALTHY MARKET";

  return {
    supplyScore,
    demandScore,
    balanceScore,
    overall,
    classification,
    totalCleaners,
    coveredHoods,
    uncoveredHoods: uncovered,
    imbalances,
    simulated: demand.some((d) => d.source === "simulated"),
  };
}
