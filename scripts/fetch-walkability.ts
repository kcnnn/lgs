/**
 * Hardcoded Walk Scores for all 25 cities (publicly visible on walkscore.com).
 * TODO: automate via Walk Score API once MVP ships.
 * Run: npx tsx scripts/fetch-walkability.ts
 */

import * as fs from "fs";
import * as path from "path";

const RAW_DIR = path.join(process.cwd(), "data/raw");
const OUT_FILE = path.join(RAW_DIR, "walkability.json");

// Walk Scores from walkscore.com — city-level scores, 2024
const WALK_SCORES: Record<string, { walkScore: number; trailCount: number }> = {
  austin: { walkScore: 49, trailCount: 18 },
  boulder: { walkScore: 62, trailCount: 40 },
  denver: { walkScore: 61, trailCount: 22 },
  "san-francisco": { walkScore: 87, trailCount: 15 },
  "los-angeles": { walkScore: 67, trailCount: 20 },
  "san-diego": { walkScore: 51, trailCount: 25 },
  miami: { walkScore: 78, trailCount: 8 },
  scottsdale: { walkScore: 37, trailCount: 35 },
  sedona: { walkScore: 28, trailCount: 55 },
  "park-city": { walkScore: 30, trailCount: 60 },
  "salt-lake-city": { walkScore: 60, trailCount: 30 },
  "santa-fe": { walkScore: 40, trailCount: 42 },
  asheville: { walkScore: 40, trailCount: 38 },
  "portland-or": { walkScore: 66, trailCount: 28 },
  seattle: { walkScore: 73, trailCount: 22 },
  bend: { walkScore: 41, trailCount: 50 },
  nyc: { walkScore: 88, trailCount: 12 },
  boston: { walkScore: 81, trailCount: 14 },
  nashville: { walkScore: 28, trailCount: 16 },
  chicago: { walkScore: 78, trailCount: 18 },
  honolulu: { walkScore: 62, trailCount: 30 },
  kauai: { walkScore: 20, trailCount: 45 },
  minneapolis: { walkScore: 70, trailCount: 20 },
  tampa: { walkScore: 48, trailCount: 12 },
  raleigh: { walkScore: 34, trailCount: 20 },
};

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });

  const output = {
    fetchedAt: new Date().toISOString(),
    source: "hardcoded-walkscore.com",
    scores: WALK_SCORES,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Wrote walkability data to ${OUT_FILE}`);
  console.log("Done: fetch-walkability");
}

main().catch(console.error);
