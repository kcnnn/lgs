export const WEIGHTS = {
  airAndEnvironment: 0.25,
  walkabilityAndNature: 0.20,
  healthyFood: 0.15,
  movement: 0.15,
  recovery: 0.15,
  longevityMedicine: 0.10,
} as const;

export type CategoryKey = keyof typeof WEIGHTS;

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  airAndEnvironment: "Air & Environment",
  walkabilityAndNature: "Walkability & Nature",
  healthyFood: "Healthy Food",
  movement: "Movement",
  recovery: "Recovery",
  longevityMedicine: "Longevity Medicine",
};

export const PLACE_QUERIES = {
  recovery: ["sauna", "cold plunge", "cryotherapy", "infrared sauna", "contrast therapy"],
  movement: ["pilates studio", "yoga studio", "climbing gym", "barre studio"],
  healthyFood: ["farmers market", "food co-op", "health food store", "organic grocery"],
  longevityMedicine: ["functional medicine", "longevity clinic", "preventive medicine clinic"],
} as const;
