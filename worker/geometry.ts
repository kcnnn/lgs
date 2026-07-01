import type { Point } from "../lib/measure";

/** Polygon centroid (signed-area formula). Falls back to the vertex average for degenerate polygons. */
export function shoelaceCentroid(polygon: Point[]): Point {
  let signedArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % polygon.length];
    const cross = x1 * y2 - x2 * y1;
    signedArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  signedArea /= 2;
  if (Math.abs(signedArea) < 1e-9) {
    const n = polygon.length || 1;
    const avgX = polygon.reduce((sum, [x]) => sum + x, 0) / n;
    const avgY = polygon.reduce((sum, [, y]) => sum + y, 0) / n;
    return [avgX, avgY];
  }
  return [cx / (6 * signedArea), cy / (6 * signedArea)];
}
