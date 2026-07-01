import type { Measurements } from "../lib/measure";

function csvRow(fields: (string | number)[]): string {
  return fields
    .map((field) => {
      const str = String(field);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    })
    .join(",");
}

export function buildLineItemsCsv(measurements: Measurements): string {
  const rows: (string | number)[][] = [
    ["Description", "Quantity", "Unit"],
    ["Roof area", measurements.squares, "SQ"],
    ["Shingles", measurements.materials.shingleBundles, "BD"],
    ["Ridge cap", round1(measurements.materials.ridgeCapLf), "LF"],
    ["Drip edge", round1(measurements.materials.dripEdgeLf), "LF"],
    ["Drip edge (10ft sticks)", measurements.materials.dripEdgeSticks, "EA"],
    ["Starter strip", round1(measurements.materials.starterLf), "LF"],
    ["Ice & water shield", round1(measurements.materials.iceWaterSf), "SF"],
    ["Underlayment", measurements.materials.underlaymentRolls, "RL"],
  ];
  if (measurements.penetrationCount > 0) {
    rows.push(["Roof penetrations (pipe boots/vents)", measurements.penetrationCount, "EA"]);
  }
  return rows.map(csvRow).join("\n") + "\n";
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
