import type { Job } from "@prisma/client";
import type { Measurements, TraceData } from "../lib/measure";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const EDGE_LABELS: Record<string, string> = {
  ridge: "Ridge",
  hip: "Hip",
  valley: "Valley",
  eave: "Eave",
  rake: "Rake",
  step_flashing: "Step flashing",
  wall_flashing: "Wall flashing",
};

export function buildReportHtml(
  job: Pick<Job, "id" | "address" | "createdAt">,
  measurements: Measurements,
  trace: TraceData,
  orthoOverlayDataUri: string,
): string {
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const facetRows = measurements.facets
    .map(
      (f) => `<tr>
        <td>${escapeHtml(f.label)}</td>
        <td>${f.pitch}/12</td>
        <td>${f.planAreaSqFt.toFixed(1)}</td>
        <td>${f.slopeFactor.toFixed(3)}</td>
        <td>${f.slopeAreaSqFt.toFixed(1)}</td>
      </tr>`,
    )
    .join("\n");

  const edgeRows = Object.entries(measurements.edgeTotals)
    .map(([type, lf]) => `<tr><td>${EDGE_LABELS[type] ?? type}</td><td>${(lf ?? 0).toFixed(1)} LF</td></tr>`)
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0a0a0a; margin: 0; padding: 40px; }
  h1, h2 { margin: 0 0 8px; }
  .accent { color: #e8590c; }
  .cover { text-align: center; padding: 80px 0 40px; page-break-after: always; }
  .cover .logo { font-size: 28px; font-weight: bold; margin-bottom: 60px; }
  .cover h1 { font-size: 24px; }
  .cover p { color: #555; margin: 4px 0; }
  section { margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
  th { background: #f5f5f5; }
  img.ortho { width: 100%; border: 1px solid #ddd; }
  .footnote { font-size: 11px; color: #666; }
  .disclaimer { font-size: 10px; color: #999; margin-top: 24px; }
</style>
</head>
<body>
  <div class="cover">
    <div class="logo">RooferClaw <span class="accent">Scope</span></div>
    <h1>Roof Measurement Report</h1>
    <p>${escapeHtml(job.address)}</p>
    <p>${reportDate}</p>
    <p>Report ID: ${escapeHtml(job.id)}</p>
  </div>

  <section>
    <h2>Orthomosaic &amp; Facets</h2>
    <img class="ortho" src="${orthoOverlayDataUri}" alt="Orthomosaic with facet outlines" />
  </section>

  <section>
    <h2>Facet Measurements</h2>
    <table>
      <thead><tr><th>Facet</th><th>Pitch</th><th>Plan Area (ft²)</th><th>Slope Factor</th><th>Slope Area (ft²)</th></tr></thead>
      <tbody>${facetRows}</tbody>
    </table>
    <p><strong>Total squares: ${measurements.squares}</strong></p>
  </section>

  <section>
    <h2>Edge Lengths</h2>
    <table>
      <thead><tr><th>Type</th><th>Length</th></tr></thead>
      <tbody>${edgeRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Materials List</h2>
    <table>
      <thead><tr><th>Item</th><th>Quantity</th></tr></thead>
      <tbody>
        <tr><td>Shingle bundles</td><td>${measurements.materials.shingleBundles}</td></tr>
        <tr><td>Ridge cap</td><td>${measurements.materials.ridgeCapLf.toFixed(1)} LF</td></tr>
        <tr><td>Drip edge</td><td>${measurements.materials.dripEdgeLf.toFixed(1)} LF (${measurements.materials.dripEdgeSticks} sticks)</td></tr>
        <tr><td>Starter strip</td><td>${measurements.materials.starterLf.toFixed(1)} LF</td></tr>
        <tr><td>Ice &amp; water shield</td><td>${measurements.materials.iceWaterSf.toFixed(1)} SF</td></tr>
        <tr><td>Underlayment</td><td>${measurements.materials.underlaymentRolls} rolls</td></tr>
        <tr><td>Roof penetrations</td><td>${measurements.penetrationCount}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="footnote">
    <p>Methodology: measurements are derived from a ${trace.feetPerPixel.toFixed(4)} ft/pixel scale calibration
      against the project orthomosaic. A ${measurements.wasteFactorPct}% waste factor is applied to shingle
      and underlayment quantities. Hip and valley lengths include a 5% slope allowance.</p>
    <p class="disclaimer">This report is generated from drone photogrammetry and admin-traced roof facets. It is an
      estimate intended to assist with material ordering and claims documentation, and should be field-verified
      before final ordering.</p>
  </section>
</body>
</html>`;
}
