import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology — LongevityScore",
  description: "How we calculate the LongevityScore for each city.",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-gray-900 tracking-tight">
            LongevityScore
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Methodology</h1>
        <p className="text-gray-500 mb-10 text-sm">How we score cities for longevity.</p>

        <div className="prose prose-gray max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What the score measures</h2>
            <p className="text-gray-700 leading-relaxed">
              The LongevityScore rates US cities on the quality of their{" "}
              <strong>longevity infrastructure</strong> — the environmental conditions and
              service density that research associates with longer, healthier lives. It is{" "}
              <em>not</em> a direct prediction of lifespan, and it is not a measure of
              individual health. A high score means the city has better-than-average air,
              walkability, access to healthy food, and density of fitness, recovery, and
              preventive medicine venues. Whether you use any of it is up to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">The six categories</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Each category produces a 0–100 subscore. The final score is a weighted average.
            </p>
            <div className="space-y-5">
              <div className="border-l-4 border-emerald-400 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Air &amp; Environment</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono">25%</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The single largest weight. Based on EPA AirNow annual average AQI, ozone
                  unhealthy days per year, and PM2.5 annual average. Formula:{" "}
                  <code className="text-xs bg-gray-100 px-1 rounded">
                    100 − (annualAQI × 1.5) − (ozone_days × 3)
                  </code>
                  , floored at 0. This category intentionally penalizes cities with serious
                  air pollution, because no amount of pilates studios compensates for
                  breathing particulate matter every day.
                </p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Walkability &amp; Nature</h3>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono">20%</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Walk Score (from walkscore.com) combined with an estimate of nearby trails
                  and parks. Formula:{" "}
                  <code className="text-xs bg-gray-100 px-1 rounded">
                    0.7 × walkScore + 0.3 × min(100, trailCount × 8)
                  </code>
                  . Walk Scores are hardcoded from the public walkscore.com data for each city.
                </p>
              </div>

              <div className="border-l-4 border-amber-400 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Healthy Food</h3>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-mono">15%</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Count of farmers markets, food co-ops, and health food stores per 100k
                  population. Formula:{" "}
                  <code className="text-xs bg-gray-100 px-1 rounded">min(100, venues_per_100k × 12)</code>.
                  Sourced from Google Places API text search within 15km of city center.
                </p>
              </div>

              <div className="border-l-4 border-purple-400 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Movement</h3>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-mono">15%</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Count of pilates studios, yoga studios, climbing gyms, and barre/HIIT studios
                  per 100k population. Formula:{" "}
                  <code className="text-xs bg-gray-100 px-1 rounded">min(100, venues_per_100k × 8)</code>.
                </p>
              </div>

              <div className="border-l-4 border-cyan-400 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Recovery</h3>
                  <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-mono">15%</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Count of sauna, cold plunge, cryotherapy, infrared sauna, and contrast
                  therapy venues per 100k population. Higher multiplier than other categories
                  because the category is genuinely sparse — even a few venues per 100k is
                  notable. Formula:{" "}
                  <code className="text-xs bg-gray-100 px-1 rounded">min(100, venues_per_100k × 25)</code>.
                </p>
              </div>

              <div className="border-l-4 border-rose-400 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Longevity Medicine</h3>
                  <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-mono">10%</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Functional medicine clinics, longevity clinics, and preventive medicine
                  practices per 100k population. We filter Google Places results to require
                  medical classification (doctor, medical_clinic, or wellness_center) and
                  exclude pure aesthetics/medspa listings. Formula:{" "}
                  <code className="text-xs bg-gray-100 px-1 rounded">min(100, venues_per_100k × 10)</code>.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Score tiers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {[
                { range: "85–100", tier: "Exceptional", color: "bg-emerald-100 text-emerald-800" },
                { range: "70–84", tier: "Strong", color: "bg-green-100 text-green-800" },
                { range: "55–69", tier: "Decent", color: "bg-amber-100 text-amber-800" },
                { range: "40–54", tier: "Mixed", color: "bg-orange-100 text-orange-800" },
                { range: "Below 40", tier: "Poor", color: "bg-red-100 text-red-800" },
              ].map((t) => (
                <div key={t.tier} className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.color}`}>{t.tier}</span>
                  <span className="text-gray-500 text-xs">{t.range}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Data sources</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
              <li>
                <strong>Air quality:</strong> EPA AirNow (annual AQI averages and ozone unhealthy
                days). Where live API data is unavailable, we use 2023 annual averages from EPA
                published reports.
              </li>
              <li>
                <strong>Venue data:</strong> Google Places API text search, 15km radius from
                city center. Fetched periodically and cached.
              </li>
              <li>
                <strong>Walk Score:</strong> City-level scores from walkscore.com (hardcoded
                for MVP; will be automated via Walk Score API in a future update).
              </li>
              <li>
                <strong>Population:</strong> US Census Bureau 2023 estimates.
              </li>
            </ul>
          </section>

          <section className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <h2 className="text-lg font-bold text-amber-900 mb-3">Limitations &amp; honesty</h2>
            <ul className="space-y-2 text-amber-800 text-sm">
              <li>
                <strong>Places API has noise.</strong> Google Places returns businesses that may
                have closed, mislabeled categories, or duplicate listings. The venue counts are
                directionally correct but not audited.
              </li>
              <li>
                <strong>The score correlates with available infrastructure, not actual lifespan.</strong>{" "}
                A city scoring 80 has better longevity-relevant infrastructure than one scoring 40.
                It does not mean residents of that city live longer.
              </li>
              <li>
                <strong>The weights are editorial choices.</strong> Giving Air &amp; Environment 25%
                is a deliberate position: we believe environmental exposure is foundational and
                difficult to compensate for with behavior. Reasonable people could weight the
                categories differently.
              </li>
              <li>
                <strong>Only 25 cities.</strong> The MVP covers cities the target audience
                (longevity-aware, mobile professionals) most commonly considers. Many cities are
                not represented.
              </li>
              <li>
                <strong>Static data.</strong> Scores are updated when we run the data pipeline,
                not in real time. AQI values are annual averages, not current conditions.
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-2">
            ← Back to leaderboard
          </Link>
        </div>
      </main>
    </div>
  );
}
