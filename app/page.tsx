import fs from "fs";
import path from "path";
import Link from "next/link";
import { Leaderboard } from "@/components/Leaderboard";
import type { CityData } from "@/lib/types";
import { CITIES } from "@/data/cities-config";

function loadAllCities(): CityData[] {
  const dir = path.join(process.cwd(), "data/cities");
  return CITIES.flatMap((city) => {
    const p = path.join(dir, `${city.slug}.json`);
    if (!fs.existsSync(p)) return [];
    return [JSON.parse(fs.readFileSync(p, "utf-8")) as CityData];
  });
}

export default function HomePage() {
  const cities = loadAllCities();
  const sorted = [...cities].sort((a, b) => b.totalScore - a.totalScore);
  const topCity = sorted[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-gray-900 tracking-tight">
            LongevityScore
          </Link>
          <Link href="/methodology" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Methodology
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
            How does your city score<br />for longevity?
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
            We scored 25 US cities on a 0–100 longevity scale based on six factors: air quality,
            walkability, healthy food access, fitness infrastructure, recovery venues, and
            longevity medicine. {topCity && (
              <>
                <Link href={`/city/${topCity.slug}`} className="font-semibold text-emerald-600 hover:underline">
                  {topCity.name}
                </Link>{" "}
                leads with a score of {topCity.totalScore}.
              </>
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Leaderboard cities={cities} />
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
        <p>
          Data sources: EPA AirNow, Google Places, Walk Score ·{" "}
          <Link href="/methodology" className="hover:text-gray-600 underline underline-offset-2">
            Methodology
          </Link>{" "}
          ·{" "}
          <a href="mailto:hello@longevityscore.com" className="hover:text-gray-600 underline underline-offset-2">
            Feedback
          </a>
        </p>
      </footer>
    </div>
  );
}
