import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScoreHero } from "@/components/ScoreHero";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { VenueCounts } from "@/components/VenueCounts";
import { CityComparison } from "@/components/CityComparison";
import type { CityData } from "@/lib/types";
import { CITIES } from "@/data/cities-config";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

function loadCity(slug: string): CityData | null {
  const p = path.join(process.cwd(), "data/cities", `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function loadAllCities(): CityData[] {
  const dir = path.join(process.cwd(), "data/cities");
  return CITIES.flatMap((city) => {
    const p = path.join(dir, `${city.slug}.json`);
    if (!fs.existsSync(p)) return [];
    return [JSON.parse(fs.readFileSync(p, "utf-8")) as CityData];
  });
}

function pickComparisons(current: CityData, all: CityData[]): CityData[] {
  const others = all.filter((c) => c.slug !== current.slug);
  const sorted = [...others].sort((a, b) => a.totalScore - b.totalScore);
  const currentIdx = sorted.findIndex((c) => c.totalScore >= current.totalScore);

  const candidates: CityData[] = [];

  // City with closest score above
  const above = sorted.find((c) => c.totalScore > current.totalScore);
  if (above) candidates.push(above);

  // City with closest score below
  const below = [...sorted].reverse().find((c) => c.totalScore < current.totalScore);
  if (below) candidates.push(below);

  // Contrasting city (furthest score)
  const contrast = sorted[0].slug !== current.slug ? sorted[0] : sorted[sorted.length - 1];
  if (!candidates.find((c) => c.slug === contrast.slug)) {
    candidates.push(contrast);
  }

  return candidates.slice(0, 3);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const city = loadCity(slug);
  if (!city) return { title: "City not found" };
  return {
    title: `${city.name}, ${city.state} — LongevityScore ${city.totalScore}/100`,
    description: `${city.name} scores ${city.totalScore}/100 (${city.tier}) for longevity infrastructure. Air quality, walkability, healthy food, fitness, recovery, and longevity medicine.`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = loadCity(slug);
  if (!city) notFound();

  const all = loadAllCities();
  const comparisons = pickComparisons(city, all);
  const allSorted = [...all].sort((a, b) => b.totalScore - a.totalScore);
  const rank = allSorted.findIndex((c) => c.slug === city.slug) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-gray-900 tracking-tight">
            LongevityScore
          </Link>
          <Link href="/methodology" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Methodology
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← All cities
          </Link>
          <p className="text-xs text-gray-400 mt-1">
            Ranked #{rank} of {all.length}
          </p>
        </div>

        <ScoreHero city={city} />
        <CategoryBreakdown city={city} />
        <VenueCounts city={city} />
        <CityComparison current={city} comparisons={comparisons} />

        <p className="text-center text-xs text-gray-400 pb-4">
          <Link href="/methodology" className="underline underline-offset-2 hover:text-gray-600">
            How is this calculated?
          </Link>
          {" "}· Data sourced from EPA AirNow, Google Places, and Walk Score.
        </p>
      </main>
    </div>
  );
}
