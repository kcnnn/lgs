export type Point = [number, number];

export type EdgeType =
  | "ridge"
  | "hip"
  | "valley"
  | "eave"
  | "rake"
  | "step_flashing"
  | "wall_flashing";

export type Facet = {
  label: string;
  pitch: number;
  polygon: Point[];
};

export type Edge = {
  type: EdgeType;
  polyline: Point[];
};

export type TraceData = {
  feetPerPixel: number;
  facets: Facet[];
  edges: Edge[];
  wasteFactorPct: number;
  penetrationCount: number;
};

export type FacetMeasurement = {
  label: string;
  pitch: number;
  planAreaSqFt: number;
  slopeFactor: number;
  slopeAreaSqFt: number;
};

export type EdgeTotals = Partial<Record<EdgeType, number>>;

export type Materials = {
  shingleBundles: number;
  ridgeCapLf: number;
  dripEdgeLf: number;
  dripEdgeSticks: number;
  starterLf: number;
  iceWaterSf: number;
  underlaymentRolls: number;
};

export type Measurements = {
  facets: FacetMeasurement[];
  totalPlanAreaSqFt: number;
  totalSlopeAreaSqFt: number;
  squares: number;
  edgeTotals: EdgeTotals;
  materials: Materials;
  wasteFactorPct: number;
  penetrationCount: number;
};

const HIP_VALLEY_SLOPE_ALLOWANCE = 1.05;
const ICE_WATER_COVERAGE_FT = 3;

/** Shoelace formula. Returns area in the polygon's own coordinate units squared (unsigned). */
export function shoelaceArea(polygon: Point[]): number {
  if (polygon.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % polygon.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

export function planAreaSqFt(polygon: Point[], feetPerPixel: number): number {
  return shoelaceArea(polygon) * feetPerPixel * feetPerPixel;
}

export function slopeFactor(pitch: number): number {
  return Math.sqrt(1 + Math.pow(pitch / 12, 2));
}

export function slopeCorrectedArea(planArea: number, pitch: number): number {
  return planArea * slopeFactor(pitch);
}

export function polylineLength(polyline: Point[], feetPerPixel: number): number {
  let length = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    const [x1, y1] = polyline[i];
    const [x2, y2] = polyline[i + 1];
    length += Math.hypot(x2 - x1, y2 - y1);
  }
  return length * feetPerPixel;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeEdgeTotals(edges: Edge[], feetPerPixel: number): EdgeTotals {
  const totals: EdgeTotals = {};
  for (const edge of edges) {
    const length = polylineLength(edge.polyline, feetPerPixel);
    totals[edge.type] = (totals[edge.type] ?? 0) + length;
  }
  if (totals.hip !== undefined) totals.hip *= HIP_VALLEY_SLOPE_ALLOWANCE;
  if (totals.valley !== undefined) totals.valley *= HIP_VALLEY_SLOPE_ALLOWANCE;
  return totals;
}

export function computeMaterials(
  squares: number,
  edgeTotals: EdgeTotals,
  wasteFactorPct: number,
): Materials {
  const waste = 1 + wasteFactorPct / 100;
  const ridge = edgeTotals.ridge ?? 0;
  const hip = edgeTotals.hip ?? 0;
  const valley = edgeTotals.valley ?? 0;
  const eave = edgeTotals.eave ?? 0;
  const rake = edgeTotals.rake ?? 0;

  const ridgeCapLf = ridge + hip;
  const dripEdgeLf = eave + rake;
  const starterLf = eave + rake;
  const iceWaterSf = eave * ICE_WATER_COVERAGE_FT + valley * ICE_WATER_COVERAGE_FT;

  return {
    shingleBundles: Math.ceil(squares * waste * 3),
    ridgeCapLf,
    dripEdgeLf,
    dripEdgeSticks: Math.ceil(dripEdgeLf / 10),
    starterLf,
    iceWaterSf,
    underlaymentRolls: Math.ceil((squares * waste) / 10),
  };
}

export function computeMeasurements(trace: TraceData): Measurements {
  const { feetPerPixel, facets, edges, wasteFactorPct, penetrationCount } = trace;

  const facetMeasurements: FacetMeasurement[] = facets.map((facet) => {
    const plan = planAreaSqFt(facet.polygon, feetPerPixel);
    const factor = slopeFactor(facet.pitch);
    return {
      label: facet.label,
      pitch: facet.pitch,
      planAreaSqFt: plan,
      slopeFactor: factor,
      slopeAreaSqFt: plan * factor,
    };
  });

  const totalPlanAreaSqFt = facetMeasurements.reduce((sum, f) => sum + f.planAreaSqFt, 0);
  const totalSlopeAreaSqFt = facetMeasurements.reduce((sum, f) => sum + f.slopeAreaSqFt, 0);
  const squares = round2(totalSlopeAreaSqFt / 100);

  const edgeTotals = computeEdgeTotals(edges, feetPerPixel);
  const materials = computeMaterials(squares, edgeTotals, wasteFactorPct);

  return {
    facets: facetMeasurements,
    totalPlanAreaSqFt,
    totalSlopeAreaSqFt,
    squares,
    edgeTotals,
    materials,
    wasteFactorPct,
    penetrationCount,
  };
}
