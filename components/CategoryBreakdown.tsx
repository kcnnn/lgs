import type { CityData } from "@/lib/types";
import type { CategoryKey } from "@/data/weights";
import { CATEGORY_LABELS } from "@/data/weights";
import { scoreBg, scoreColor } from "@/lib/format";

export function CategoryBreakdown({ city }: { city: CityData }) {
  const keys = Object.keys(city.categories) as CategoryKey[];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Score Breakdown</h2>
      <div className="space-y-5">
        {keys.map((key) => {
          const cat = city.categories[key];
          const label = CATEGORY_LABELS[key];
          const pct = Math.round(cat.weight * 100);
          const barColor = scoreBg(cat.score);
          const numColor = scoreColor(cat.score);

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {pct}%
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{label}</span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${numColor}`}>
                  {cat.score}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{cat.summary}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
