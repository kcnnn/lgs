import { describe, expect, it } from "vitest";
import {
  shoelaceArea,
  slopeFactor,
  polylineLength,
  computeMeasurements,
  type TraceData,
} from "./measure";

describe("shoelaceArea", () => {
  it("computes the area of a rectangle", () => {
    expect(
      shoelaceArea([
        [0, 0],
        [40, 0],
        [40, 30],
        [0, 30],
      ]),
    ).toBeCloseTo(1200, 6);
  });
});

describe("slopeFactor", () => {
  it("is 1 for a flat roof", () => {
    expect(slopeFactor(0)).toBe(1);
  });

  it("matches sqrt(1 + (pitch/12)^2) for a 6/12 pitch", () => {
    expect(slopeFactor(6)).toBeCloseTo(Math.sqrt(1.25), 8);
  });
});

describe("polylineLength", () => {
  it("sums segment lengths and applies feetPerPixel", () => {
    expect(
      polylineLength(
        [
          [0, 0],
          [3, 4],
          [3, 0],
        ],
        2,
      ),
    ).toBeCloseTo((5 + 4) * 2, 6);
  });
});

// Hand-computed fixture: a single 40ft x 30ft rectangular facet at a 6/12 pitch,
// feetPerPixel = 1 (pixel space == feet), with a ridge/eave along the 40ft sides,
// two rakes along the 30ft sides, plus a hip and valley to exercise the
// hip/valley slope allowance.
const fixture: TraceData = {
  feetPerPixel: 1,
  facets: [
    {
      label: "F1",
      pitch: 6,
      polygon: [
        [0, 0],
        [40, 0],
        [40, 30],
        [0, 30],
      ],
    },
  ],
  edges: [
    { type: "ridge", polyline: [[0, 0], [40, 0]] },
    { type: "eave", polyline: [[0, 30], [40, 30]] },
    { type: "rake", polyline: [[0, 0], [0, 30]] },
    { type: "rake", polyline: [[40, 0], [40, 30]] },
    { type: "hip", polyline: [[0, 0], [20, 0]] },
    { type: "valley", polyline: [[0, 0], [15, 0]] },
  ],
  wasteFactorPct: 10,
  penetrationCount: 3,
};

describe("computeMeasurements fixture roof", () => {
  const result = computeMeasurements(fixture);

  it("computes plan and slope area within 1%", () => {
    expect(result.totalPlanAreaSqFt).toBeCloseTo(1200, 0);
    expect(result.totalSlopeAreaSqFt).toBeCloseTo(1341.64, 1);
  });

  it("rounds squares to 2 decimals", () => {
    expect(result.squares).toBeCloseTo(13.42, 2);
  });

  it("applies the 5% hip/valley slope allowance", () => {
    expect(result.edgeTotals.hip).toBeCloseTo(21, 2);
    expect(result.edgeTotals.valley).toBeCloseTo(15.75, 2);
    expect(result.edgeTotals.ridge).toBeCloseTo(40, 2);
    expect(result.edgeTotals.eave).toBeCloseTo(40, 2);
    expect(result.edgeTotals.rake).toBeCloseTo(60, 2);
  });

  it("computes the materials list", () => {
    expect(result.materials.shingleBundles).toBe(45);
    expect(result.materials.ridgeCapLf).toBeCloseTo(61, 2);
    expect(result.materials.dripEdgeLf).toBeCloseTo(100, 2);
    expect(result.materials.dripEdgeSticks).toBe(10);
    expect(result.materials.starterLf).toBeCloseTo(100, 2);
    expect(result.materials.iceWaterSf).toBeCloseTo(167.25, 2);
    expect(result.materials.underlaymentRolls).toBe(2);
  });
});
