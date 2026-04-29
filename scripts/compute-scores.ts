/**
 * Reads raw data and writes scored city JSON files.
 * Run: npx tsx scripts/compute-scores.ts
 */

import * as fs from "fs";
import * as path from "path";
import { CITIES } from "../data/cities-config";
import { WEIGHTS, CATEGORY_LABELS } from "../data/weights";
import type { CategoryKey } from "../data/weights";
import type { CityData, RawPlacesData, RawAirData } from "../lib/types";
import {
  scoreAirAndEnvironment,
  scoreWalkabilityAndNature,
  scoreHealthyFood,
  scoreMovement,
  scoreRecovery,
  scoreLongevityMedicine,
  computeTotalScore,
  getTier,
} from "../lib/scoring";

const RAW_PLACES_DIR = path.join(process.cwd(), "data/raw/places");
const RAW_AIR_DIR = path.join(process.cwd(), "data/raw/air");
const WALKABILITY_FILE = path.join(process.cwd(), "data/raw/walkability.json");
const OUT_DIR = path.join(process.cwd(), "data/cities");

// City populations (US Census 2023 estimates)
const POPULATIONS: Record<string, number> = {
  austin: 978908,
  boulder: 105112,
  denver: 715522,
  "san-francisco": 873965,
  "los-angeles": 3898747,
  "san-diego": 1386932,
  miami: 442241,
  scottsdale: 258069,
  sedona: 9684,
  "park-city": 8858,
  "salt-lake-city": 199723,
  "santa-fe": 84683,
  asheville: 94067,
  "portland-or": 652503,
  seattle: 749256,
  bend: 99178,
  nyc: 8336817,
  boston: 675647,
  nashville: 689447,
  chicago: 2696555,
  honolulu: 350964,
  kauai: 72293,
  minneapolis: 429606,
  tampa: 403364,
  raleigh: 467665,
};

function loadPlaces(slug: string): RawPlacesData | null {
  const p = path.join(RAW_PLACES_DIR, `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function loadAir(slug: string): RawAirData | null {
  const p = path.join(RAW_AIR_DIR, `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function loadWalkability(): Record<string, { walkScore: number; trailCount: number }> {
  if (!fs.existsSync(WALKABILITY_FILE)) return {};
  const data = JSON.parse(fs.readFileSync(WALKABILITY_FILE, "utf-8"));
  return data.scores ?? {};
}

// Fallback place counts when no Places API data available
const FALLBACK_COUNTS: Record<string, Record<string, number>> = {
  austin: { recovery: 18, movement: 95, healthyFood: 22, longevityMedicine: 12 },
  boulder: { recovery: 15, movement: 65, healthyFood: 28, longevityMedicine: 18 },
  denver: { recovery: 22, movement: 110, healthyFood: 32, longevityMedicine: 20 },
  "san-francisco": { recovery: 25, movement: 140, healthyFood: 55, longevityMedicine: 35 },
  "los-angeles": { recovery: 60, movement: 320, healthyFood: 95, longevityMedicine: 75 },
  "san-diego": { recovery: 28, movement: 130, healthyFood: 45, longevityMedicine: 30 },
  miami: { recovery: 20, movement: 85, healthyFood: 30, longevityMedicine: 22 },
  scottsdale: { recovery: 22, movement: 80, healthyFood: 28, longevityMedicine: 25 },
  sedona: { recovery: 8, movement: 12, healthyFood: 6, longevityMedicine: 5 },
  "park-city": { recovery: 10, movement: 18, healthyFood: 8, longevityMedicine: 6 },
  "salt-lake-city": { recovery: 16, movement: 75, healthyFood: 25, longevityMedicine: 14 },
  "santa-fe": { recovery: 10, movement: 28, healthyFood: 14, longevityMedicine: 10 },
  asheville: { recovery: 12, movement: 35, healthyFood: 18, longevityMedicine: 10 },
  "portland-or": { recovery: 25, movement: 100, healthyFood: 55, longevityMedicine: 28 },
  seattle: { recovery: 30, movement: 130, healthyFood: 60, longevityMedicine: 38 },
  bend: { recovery: 12, movement: 32, healthyFood: 15, longevityMedicine: 8 },
  nyc: { recovery: 85, movement: 650, healthyFood: 180, longevityMedicine: 120 },
  boston: { recovery: 28, movement: 145, healthyFood: 55, longevityMedicine: 45 },
  nashville: { recovery: 18, movement: 75, healthyFood: 22, longevityMedicine: 15 },
  chicago: { recovery: 40, movement: 280, healthyFood: 85, longevityMedicine: 55 },
  honolulu: { recovery: 12, movement: 55, healthyFood: 30, longevityMedicine: 14 },
  kauai: { recovery: 5, movement: 12, healthyFood: 8, longevityMedicine: 3 },
  minneapolis: { recovery: 20, movement: 95, healthyFood: 35, longevityMedicine: 22 },
  tampa: { recovery: 15, movement: 70, healthyFood: 22, longevityMedicine: 16 },
  raleigh: { recovery: 16, movement: 65, healthyFood: 22, longevityMedicine: 14 },
};

function computeCity(city: (typeof CITIES)[number]): CityData {
  const population = POPULATIONS[city.slug] ?? 500000;
  const placesData = loadPlaces(city.slug);
  const airData = loadAir(city.slug);
  const walkability = loadWalkability();
  const walk = walkability[city.slug] ?? { walkScore: 45, trailCount: 20 };

  // Venue counts from Places API or fallback
  const fallback = FALLBACK_COUNTS[city.slug] ?? { recovery: 10, movement: 50, healthyFood: 15, longevityMedicine: 8 };
  const recoveryCount = placesData?.results?.recovery?.length ?? fallback.recovery;
  const movementCount = placesData?.results?.movement?.length ?? fallback.movement;
  const healthyFoodCount = placesData?.results?.healthyFood?.length ?? fallback.healthyFood;
  const longevityMedCount = placesData?.results?.longevityMedicine?.length ?? fallback.longevityMedicine;

  // Air quality defaults
  const annualAQI = airData?.annualAQI ?? 45;
  const ozoneUnhealthyDays = airData?.ozoneUnhealthyDays ?? 15;
  const pm25Annual = airData?.pm25Annual ?? 10;

  const airScore = scoreAirAndEnvironment(annualAQI, ozoneUnhealthyDays);
  const walkScore = scoreWalkabilityAndNature(walk.walkScore, walk.trailCount);
  const foodScore = scoreHealthyFood(healthyFoodCount, population);
  const movScore = scoreMovement(movementCount, population);
  const recScore = scoreRecovery(recoveryCount, population);
  const longevityScore = scoreLongevityMedicine(longevityMedCount, population);

  const categories: CityData["categories"] = {
    airAndEnvironment: {
      score: airScore,
      weight: WEIGHTS.airAndEnvironment,
      summary: `Annual AQI ${annualAQI}, ${ozoneUnhealthyDays} ozone unhealthy days/yr`,
      inputs: { annualAQI, ozoneUnhealthyDays, pm25Annual },
    },
    walkabilityAndNature: {
      score: walkScore,
      weight: WEIGHTS.walkabilityAndNature,
      summary: `Walk Score ${walk.walkScore}, ${walk.trailCount} nearby trails`,
      inputs: { walkScore: walk.walkScore, trailCount: walk.trailCount },
    },
    healthyFood: {
      score: foodScore,
      weight: WEIGHTS.healthyFood,
      summary: `${healthyFoodCount} farmers markets, co-ops & health food stores`,
      inputs: { venueCount: healthyFoodCount, population, per100k: +((healthyFoodCount / population) * 100000).toFixed(1) },
    },
    movement: {
      score: movScore,
      weight: WEIGHTS.movement,
      summary: `${movementCount} pilates, yoga, climbing & fitness studios`,
      inputs: { venueCount: movementCount, population, per100k: +((movementCount / population) * 100000).toFixed(1) },
    },
    recovery: {
      score: recScore,
      weight: WEIGHTS.recovery,
      summary: `${recoveryCount} sauna, cold plunge & contrast therapy venues`,
      inputs: { venueCount: recoveryCount, population, per100k: +((recoveryCount / population) * 100000).toFixed(1) },
    },
    longevityMedicine: {
      score: longevityScore,
      weight: WEIGHTS.longevityMedicine,
      summary: `${longevityMedCount} functional medicine & longevity clinics`,
      inputs: { venueCount: longevityMedCount, population, per100k: +((longevityMedCount / population) * 100000).toFixed(1) },
    },
  };

  const totalScore = computeTotalScore(categories);

  return {
    slug: city.slug,
    name: city.name,
    state: city.state,
    population,
    lastUpdated: new Date().toISOString().split("T")[0],
    totalScore,
    tier: getTier(totalScore),
    categories,
    venueCounts: {
      saunaColdPlunge: recoveryCount,
      functionalMedicine: longevityMedCount,
      farmersMarkets: healthyFoodCount,
      pilatesYoga: movementCount,
      healthFoodStores: healthyFoodCount,
      trailsOver2mi: walk.trailCount,
    },
    airQuality: { annualAQI, ozoneUnhealthyDays, pm25Annual },
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const city of CITIES) {
    console.log(`Computing score for ${city.name}, ${city.state}...`);
    try {
      const data = computeCity(city);
      const outPath = path.join(OUT_DIR, `${city.slug}.json`);
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
      console.log(`  [ok] ${city.name}: ${data.totalScore} (${data.tier})`);
    } catch (err) {
      console.error(`  [error] ${city.name}: ${(err as Error).message}`);
    }
  }

  console.log("\nDone: compute-scores");
}

main().catch(console.error);
