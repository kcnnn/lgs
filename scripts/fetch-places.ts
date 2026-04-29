/**
 * Fetches Google Places data for each city and saves raw results.
 * Run: npx tsx scripts/fetch-places.ts
 */

import * as fs from "fs";
import * as path from "path";
import { CITIES } from "../data/cities-config";
import { PLACE_QUERIES } from "../data/weights";
import type { PlaceResult, RawPlacesData } from "../lib/types";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const RAW_DIR = path.join(process.cwd(), "data/raw/places");

async function searchPlaces(
  query: string,
  lat: number,
  lng: number,
  radius = 15000
): Promise<PlaceResult[]> {
  if (!API_KEY) throw new Error("GOOGLE_PLACES_API_KEY not set");

  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", radius.toString());
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Places API error: ${res.status}`);

  const data = await res.json() as { results: PlaceResult[]; status: string };
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places API status: ${data.status}`);
  }

  return (data.results ?? []).map((r) => ({
    place_id: r.place_id,
    name: r.name,
    types: r.types ?? [],
    rating: r.rating,
    user_ratings_total: r.user_ratings_total,
  }));
}

function dedupeByPlaceId(results: PlaceResult[]): PlaceResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.place_id)) return false;
    seen.add(r.place_id);
    return true;
  });
}

function filterLongevityMedicine(places: PlaceResult[]): PlaceResult[] {
  const ALLOW_TYPES = new Set(["doctor", "medical_clinic", "wellness_center"]);
  const DENY_TYPES = new Set(["beauty_salon", "hair_care"]);
  return places.filter((p) => {
    const types = new Set(p.types);
    const hasDeny = [...DENY_TYPES].some((t) => types.has(t));
    if (hasDeny) return false;
    return [...ALLOW_TYPES].some((t) => types.has(t));
  });
}

async function fetchCity(city: (typeof CITIES)[number]): Promise<void> {
  const outPath = path.join(RAW_DIR, `${city.slug}.json`);

  // Skip if already fetched today
  if (fs.existsSync(outPath)) {
    const existing = JSON.parse(fs.readFileSync(outPath, "utf-8")) as RawPlacesData;
    const age = Date.now() - new Date(existing.fetchedAt).getTime();
    if (age < 24 * 60 * 60 * 1000) {
      console.log(`  [skip] ${city.name} — cached`);
      return;
    }
  }

  const allResults: Record<string, PlaceResult[]> = {};

  for (const [category, queries] of Object.entries(PLACE_QUERIES)) {
    const categoryResults: PlaceResult[] = [];
    for (const query of queries) {
      try {
        const results = await searchPlaces(query, city.lat, city.lng);
        categoryResults.push(...results);
        await new Promise((r) => setTimeout(r, 200)); // rate limiting
      } catch (err) {
        console.warn(`  [warn] ${city.name} / ${query}: ${(err as Error).message}`);
      }
    }

    let deduped = dedupeByPlaceId(categoryResults);
    if (category === "longevityMedicine") {
      deduped = filterLongevityMedicine(deduped);
    }
    allResults[category] = deduped;
  }

  const output: RawPlacesData = {
    slug: city.slug,
    fetchedAt: new Date().toISOString(),
    results: allResults,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`  [ok] ${city.name} — wrote ${outPath}`);
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });

  for (const city of CITIES) {
    console.log(`Fetching places for ${city.name}, ${city.state}...`);
    try {
      await fetchCity(city);
    } catch (err) {
      console.error(`  [error] ${city.name}: ${(err as Error).message}`);
    }
  }

  console.log("\nDone: fetch-places");
}

main().catch(console.error);
