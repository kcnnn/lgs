import type { CityData } from "@/lib/types";
import { scoreColor, tierColor } from "@/lib/format";

export function ScoreHero({ city }: { city: CityData }) {
  const color = scoreColor(city.totalScore);

  return (
    <div className="text-center py-10 px-4">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">
        {city.name}, {city.state}
      </p>
      <div className={`text-8xl font-black tabular-nums ${color}`}>
        {city.totalScore}
      </div>
      <p className="text-gray-400 text-sm mt-1 mb-4">out of 100</p>
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${tierColor(city.tier)}`}>
        {city.tier}
      </span>
      <p className="text-xs text-gray-400 mt-3">
        Population {city.population.toLocaleString()} · Last updated {city.lastUpdated}
      </p>
    </div>
  );
}
