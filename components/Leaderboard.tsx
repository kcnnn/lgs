"use client";

import { useState } from "react";
import Link from "next/link";
import type { CityData } from "@/lib/types";
import type { CategoryKey } from "@/data/weights";
import { CATEGORY_LABELS } from "@/data/weights";
import { scoreColor, tierColor } from "@/lib/format";

const SORT_OPTIONS: { value: "total" | CategoryKey; label: string }[] = [
  { value: "total", label: "Total Score" },
  { value: "airAndEnvironment", label: "Air & Environment" },
  { value: "walkabilityAndNature", label: "Walkability & Nature" },
  { value: "healthyFood", label: "Healthy Food" },
  { value: "movement", label: "Movement" },
  { value: "recovery", label: "Recovery" },
  { value: "longevityMedicine", label: "Longevity Medicine" },
];

export function Leaderboard({ cities }: { cities: CityData[] }) {
  const [sortBy, setSortBy] = useState<"total" | CategoryKey>("total");

  const sorted = [...cities].sort((a, b) => {
    const aScore = sortBy === "total" ? a.totalScore : a.categories[sortBy].score;
    const bScore = sortBy === "total" ? b.totalScore : b.categories[sortBy].score;
    return bScore - aScore;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-sm text-gray-500 self-center mr-1">Sort by:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              sortBy === opt.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map((city, i) => {
          const displayScore = sortBy === "total" ? city.totalScore : city.categories[sortBy].score;
          const catKeys = Object.keys(city.categories) as CategoryKey[];
          const best = catKeys.reduce((a, b) =>
            city.categories[a].score > city.categories[b].score ? a : b
          );
          const worst = catKeys.reduce((a, b) =>
            city.categories[a].score < city.categories[b].score ? a : b
          );

          return (
            <Link
              key={city.slug}
              href={`/city/${city.slug}`}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
            >
              <span className="text-sm font-mono text-gray-400 w-7 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{city.name}</span>
                  <span className="text-sm text-gray-500">{city.state}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColor(city.tier)}`}>
                    {city.tier}
                  </span>
                </div>
                {sortBy === "total" && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    <span className="text-emerald-600">↑ {CATEGORY_LABELS[best]}</span>
                    <span className="mx-1">·</span>
                    <span className="text-red-500">↓ {CATEGORY_LABELS[worst]}</span>
                  </div>
                )}
                {sortBy !== "total" && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    Total score: {city.totalScore}
                  </div>
                )}
              </div>
              <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                <div
                  className={`h-full rounded-full ${displayScore >= 80 ? "bg-emerald-500" : displayScore >= 60 ? "bg-amber-500" : "bg-red-400"}`}
                  style={{ width: `${displayScore}%` }}
                />
              </div>
              <span className={`text-xl font-black tabular-nums w-10 text-right ${scoreColor(displayScore)}`}>
                {displayScore}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
