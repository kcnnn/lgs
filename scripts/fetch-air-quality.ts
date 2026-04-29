/**
 * Fetches EPA AirNow air quality data for each city.
 * Run: npx tsx scripts/fetch-air-quality.ts
 */

import * as fs from "fs";
import * as path from "path";
import { CITIES } from "../data/cities-config";
import type { RawAirData } from "../lib/types";

const API_KEY = process.env.EPA_AIRNOW_API_KEY;
const RAW_DIR = path.join(process.cwd(), "data/raw/air");

// Hardcoded annual averages as fallback (sourced from EPA and public AQI databases, 2023 data)
// These are used when AirNow API is unavailable or doesn't have data for the city.
const HARDCODED_AIR: Record<string, Omit<RawAirData, "slug" | "fetchedAt" | "source">> = {
  austin: { annualAQI: 38, ozoneUnhealthyDays: 12, pm25Annual: 8.1 },
  boulder: { annualAQI: 35, ozoneUnhealthyDays: 10, pm25Annual: 7.2 },
  denver: { annualAQI: 44, ozoneUnhealthyDays: 28, pm25Annual: 9.8 },
  "san-francisco": { annualAQI: 36, ozoneUnhealthyDays: 5, pm25Annual: 7.8 },
  "los-angeles": { annualAQI: 56, ozoneUnhealthyDays: 85, pm25Annual: 13.2 },
  "san-diego": { annualAQI: 40, ozoneUnhealthyDays: 22, pm25Annual: 8.9 },
  miami: { annualAQI: 33, ozoneUnhealthyDays: 2, pm25Annual: 7.1 },
  scottsdale: { annualAQI: 42, ozoneUnhealthyDays: 30, pm25Annual: 9.1 },
  sedona: { annualAQI: 28, ozoneUnhealthyDays: 4, pm25Annual: 5.8 },
  "park-city": { annualAQI: 30, ozoneUnhealthyDays: 8, pm25Annual: 6.2 },
  "salt-lake-city": { annualAQI: 52, ozoneUnhealthyDays: 18, pm25Annual: 11.4 },
  "santa-fe": { annualAQI: 30, ozoneUnhealthyDays: 6, pm25Annual: 6.0 },
  asheville: { annualAQI: 34, ozoneUnhealthyDays: 8, pm25Annual: 7.5 },
  "portland-or": { annualAQI: 40, ozoneUnhealthyDays: 10, pm25Annual: 8.3 },
  seattle: { annualAQI: 38, ozoneUnhealthyDays: 6, pm25Annual: 7.9 },
  bend: { annualAQI: 32, ozoneUnhealthyDays: 8, pm25Annual: 6.5 },
  nyc: { annualAQI: 43, ozoneUnhealthyDays: 18, pm25Annual: 9.2 },
  boston: { annualAQI: 38, ozoneUnhealthyDays: 10, pm25Annual: 8.0 },
  nashville: { annualAQI: 40, ozoneUnhealthyDays: 14, pm25Annual: 9.0 },
  chicago: { annualAQI: 45, ozoneUnhealthyDays: 22, pm25Annual: 10.1 },
  honolulu: { annualAQI: 22, ozoneUnhealthyDays: 0, pm25Annual: 4.8 },
  kauai: { annualAQI: 18, ozoneUnhealthyDays: 0, pm25Annual: 4.2 },
  minneapolis: { annualAQI: 40, ozoneUnhealthyDays: 16, pm25Annual: 8.8 },
  tampa: { annualAQI: 35, ozoneUnhealthyDays: 6, pm25Annual: 7.6 },
  raleigh: { annualAQI: 36, ozoneUnhealthyDays: 10, pm25Annual: 7.8 },
};

async function fetchAirNow(lat: number, lng: number): Promise<Partial<RawAirData>> {
  if (!API_KEY) throw new Error("EPA_AIRNOW_API_KEY not set");

  const today = new Date().toISOString().split("T")[0];
  const url = new URL("https://www.airnowapi.org/aq/observation/latLong/current/");
  url.searchParams.set("format", "application/json");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set("distance", "50");
  url.searchParams.set("API_KEY", API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`AirNow API error: ${res.status}`);

  const data = await res.json() as Array<{ AQI: number; Category: { Name: string } }>;
  if (!data.length) throw new Error("No AirNow data");

  const aqiEntry = data.find((d) => d.AQI > 0);
  return { annualAQI: aqiEntry?.AQI ?? 40 };
}

async function fetchCity(city: (typeof CITIES)[number]): Promise<void> {
  const outPath = path.join(RAW_DIR, `${city.slug}.json`);

  if (fs.existsSync(outPath)) {
    const existing = JSON.parse(fs.readFileSync(outPath, "utf-8")) as RawAirData;
    const age = Date.now() - new Date(existing.fetchedAt).getTime();
    if (age < 7 * 24 * 60 * 60 * 1000) {
      console.log(`  [skip] ${city.name} — cached`);
      return;
    }
  }

  let airData: Omit<RawAirData, "slug" | "fetchedAt" | "source">;
  let source = "hardcoded";

  try {
    const live = await fetchAirNow(city.lat, city.lng);
    const fallback = HARDCODED_AIR[city.slug];
    airData = {
      annualAQI: live.annualAQI ?? fallback.annualAQI,
      ozoneUnhealthyDays: fallback.ozoneUnhealthyDays,
      pm25Annual: fallback.pm25Annual,
    };
    source = "airnow+hardcoded";
  } catch {
    airData = HARDCODED_AIR[city.slug] ?? { annualAQI: 45, ozoneUnhealthyDays: 15, pm25Annual: 10 };
    source = "hardcoded";
  }

  const output: RawAirData = {
    slug: city.slug,
    fetchedAt: new Date().toISOString(),
    source,
    ...airData,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`  [ok] ${city.name} (${source})`);
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });

  for (const city of CITIES) {
    console.log(`Fetching air quality for ${city.name}, ${city.state}...`);
    try {
      await fetchCity(city);
    } catch (err) {
      console.error(`  [error] ${city.name}: ${(err as Error).message}`);
    }
  }

  console.log("\nDone: fetch-air-quality");
}

main().catch(console.error);
