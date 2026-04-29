export function formatScore(score: number): string {
  return score.toFixed(0);
}

export function formatPop(population: number): string {
  if (population >= 1_000_000) return `${(population / 1_000_000).toFixed(1)}M`;
  if (population >= 1_000) return `${(population / 1_000).toFixed(0)}K`;
  return population.toString();
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-500";
}

export function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function tierColor(tier: string): string {
  switch (tier) {
    case "Exceptional": return "bg-emerald-100 text-emerald-800";
    case "Strong": return "bg-green-100 text-green-800";
    case "Decent": return "bg-amber-100 text-amber-800";
    case "Mixed": return "bg-orange-100 text-orange-800";
    case "Poor": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}
