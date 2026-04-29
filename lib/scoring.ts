import type { CityData, Tier } from "./types";
import type { CategoryKey } from "@/data/weights";
import { WEIGHTS } from "@/data/weights";

export function getTier(score: number): Tier {
  if (score >= 85) return "Exceptional";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Decent";
  if (score >= 40) return "Mixed";
  return "Poor";
}

export function scoreAirAndEnvironment(annualAQI: number, ozoneUnhealthyDays: number): number {
  const raw = 100 - annualAQI * 1.5 - ozoneUnhealthyDays * 3;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function scoreWalkabilityAndNature(walkScore: number, trailCount: number): number {
  const raw = 0.7 * walkScore + 0.3 * Math.min(100, trailCount * 8);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function scoreHealthyFood(venueCount: number, population: number): number {
  const per100k = (venueCount / population) * 100000;
  return Math.min(100, Math.round(per100k * 12));
}

export function scoreMovement(venueCount: number, population: number): number {
  const per100k = (venueCount / population) * 100000;
  return Math.min(100, Math.round(per100k * 8));
}

export function scoreRecovery(venueCount: number, population: number): number {
  const per100k = (venueCount / population) * 100000;
  return Math.min(100, Math.round(per100k * 25));
}

export function scoreLongevityMedicine(venueCount: number, population: number): number {
  const per100k = (venueCount / population) * 100000;
  return Math.min(100, Math.round(per100k * 10));
}

export function computeTotalScore(categories: CityData["categories"]): number {
  let total = 0;
  for (const key of Object.keys(WEIGHTS) as CategoryKey[]) {
    total += categories[key].score * WEIGHTS[key];
  }
  return Math.round(total);
}
