import type { CityData } from "@/lib/types";

type StatCard = {
  label: string;
  value: string | number;
  sub?: string;
};

export function VenueCounts({ city }: { city: CityData }) {
  const stats: StatCard[] = [
    { label: "Sauna / Cold Plunge", value: city.venueCounts.saunaColdPlunge, sub: "venues" },
    { label: "Functional Medicine", value: city.venueCounts.functionalMedicine, sub: "clinics" },
    { label: "Farmers Markets", value: city.venueCounts.farmersMarkets, sub: "& health food" },
    { label: "Pilates / Yoga", value: city.venueCounts.pilatesYoga, sub: "studios" },
    { label: "Annual AQI", value: city.airQuality.annualAQI, sub: "lower is better" },
    { label: "Nearby Trails", value: city.venueCounts.trailsOver2mi, sub: ">2 mi within 30 min" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">By the Numbers</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-black text-gray-900 tabular-nums">{s.value}</div>
            <div className="text-xs font-semibold text-gray-700 mt-1">{s.label}</div>
            {s.sub && <div className="text-xs text-gray-400">{s.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
