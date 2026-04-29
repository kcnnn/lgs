import type { CategoryKey } from "@/data/weights";

export type Tier = "Exceptional" | "Strong" | "Decent" | "Mixed" | "Poor";

export type CategoryScore = {
  score: number;
  weight: number;
  summary: string;
  inputs: Record<string, number | string>;
};

export type CityData = {
  slug: string;
  name: string;
  state: string;
  population: number;
  lastUpdated: string;
  totalScore: number;
  tier: Tier;
  categories: Record<CategoryKey, CategoryScore>;
  venueCounts: {
    saunaColdPlunge: number;
    functionalMedicine: number;
    farmersMarkets: number;
    pilatesYoga: number;
    healthFoodStores: number;
    trailsOver2mi: number;
  };
  airQuality: {
    annualAQI: number;
    ozoneUnhealthyDays: number;
    pm25Annual: number;
  };
};

export type RawPlacesData = {
  slug: string;
  fetchedAt: string;
  results: Record<string, PlaceResult[]>;
};

export type PlaceResult = {
  place_id: string;
  name: string;
  types: string[];
  rating?: number;
  user_ratings_total?: number;
};

export type RawAirData = {
  slug: string;
  fetchedAt: string;
  annualAQI: number;
  ozoneUnhealthyDays: number;
  pm25Annual: number;
  source: string;
};
