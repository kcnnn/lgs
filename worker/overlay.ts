import sharp from "sharp";
import type { TraceData } from "../lib/measure";
import { shoelaceCentroid } from "./geometry";

const MAX_WIDTH = 1600;

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function buildOrthoOverlayDataUri(orthoPngUrl: string, trace: TraceData): Promise<string> {
  const res = await fetch(orthoPngUrl);
  if (!res.ok) throw new Error(`Failed to fetch ortho image: ${res.status}`);
  const original = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(original, { limitInputPixels: false }).metadata();
  const originalWidth = meta.width ?? MAX_WIDTH;
  const originalHeight = meta.height ?? MAX_WIDTH;
  const scale = Math.min(1, MAX_WIDTH / originalWidth);
  const width = Math.round(originalWidth * scale);
  const height = Math.round(originalHeight * scale);

  const facetsSvg = trace.facets
    .map((facet) => {
      const points = facet.polygon.map(([x, y]) => `${x * scale},${y * scale}`).join(" ");
      const [cx, cy] = shoelaceCentroid(facet.polygon);
      return `<polygon points="${points}" fill="rgba(232,89,12,0.15)" stroke="#e8590c" stroke-width="2" />
<text x="${cx * scale}" y="${cy * scale}" fill="#e8590c" font-size="20" font-weight="bold" text-anchor="middle" font-family="sans-serif">${escapeXml(facet.label)}</text>`;
    })
    .join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${facetsSvg}</svg>`;

  const composited = await sharp(original, { limitInputPixels: false })
    .resize({ width, height })
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${composited.toString("base64")}`;
}
