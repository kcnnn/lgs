import Link from "next/link";
import type { CityData } from "@/lib/types";
import { scoreColor, tierColor } from "@/lib/format";

export function CityComparison({ current, comparisons }: { current: CityData; comparisons: CityData[] }) {
  if (!comparisons.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Compare with Similar Cities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {comparisons.map((city) => (
          <Link
            key={city.slug}
            href={`/city/${city.slug}`}
            className="border border-gray-100 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all text-center"
          >
            <div className="text-sm font-semibold text-gray-700">
              {city.name}, {city.state}
            </div>
            <div className={`text-3xl font-black tabular-nums mt-1 ${scoreColor(city.totalScore)}`}>
              {city.totalScore}
            </div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tierColor(city.tier)}`}>
              {city.tier}
            </span>
            <div className="text-xs text-gray-400 mt-1">
              {city.totalScore > current.totalScore
                ? `+${city.totalScore - current.totalScore} pts`
                : city.totalScore < current.totalScore
                ? `${city.totalScore - current.totalScore} pts`
                : "Same score"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
