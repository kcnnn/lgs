"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import type L from "leaflet";
import {
  computeMeasurements,
  type EdgeType,
  type Measurements,
  type Point,
  type TraceData,
} from "@/lib/measure";

const EDGE_TYPES: EdgeType[] = [
  "ridge",
  "hip",
  "valley",
  "eave",
  "rake",
  "step_flashing",
  "wall_flashing",
];

const EDGE_COLORS: Record<EdgeType, string> = {
  ridge: "#dc2626",
  hip: "#ea580c",
  valley: "#2563eb",
  eave: "#16a34a",
  rake: "#7c3aed",
  step_flashing: "#ca8a04",
  wall_flashing: "#57534e",
};

type FacetState = { id: string; label: string; pitch: number; layer: L.Polygon };
type EdgeState = { id: string; type: EdgeType; layer: L.Polyline };

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `id-${idCounter}`;
}

function latLngsToPixelLength(latlngs: L.LatLng[]): number {
  let length = 0;
  for (let i = 0; i < latlngs.length - 1; i++) {
    const a = latlngs[i];
    const b = latlngs[i + 1];
    length += Math.hypot(b.lng - a.lng, b.lat - a.lat);
  }
  return length;
}

export function TraceMap({
  jobId,
  orthoPngUrl,
  initialTraceData,
}: {
  jobId: string;
  orthoPngUrl: string;
  initialTraceData: TraceData | null;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const facetsGroupRef = useRef<L.FeatureGroup | null>(null);
  const edgesGroupRef = useRef<L.FeatureGroup | null>(null);
  const calibratingRef = useRef(false);
  const leafletRef = useRef<typeof L | null>(null);

  const [facets, setFacets] = useState<FacetState[]>([]);
  const [edges, setEdges] = useState<EdgeState[]>([]);
  const [feetPerPixel, setFeetPerPixel] = useState<number | null>(
    initialTraceData?.feetPerPixel ?? null,
  );
  const [wasteFactorPct, setWasteFactorPct] = useState(initialTraceData?.wasteFactorPct ?? 10);
  const [penetrationCount, setPenetrationCount] = useState(
    initialTraceData?.penetrationCount ?? 0,
  );
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      await import("leaflet-draw");
      if (cancelled || !mapContainerRef.current) return;
      leafletRef.current = L;

      const img = new Image();
      img.src = orthoPngUrl;
      await img.decode().catch(() => {});
      const width = img.naturalWidth || 1000;
      const height = img.naturalHeight || 1000;
      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [height, width],
      ];

      const map = L.map(mapContainerRef.current, {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxZoom: 4,
      });
      L.imageOverlay(orthoPngUrl, bounds).addTo(map);
      map.fitBounds(bounds);
      mapRef.current = map;

      const facetsGroup = new L.FeatureGroup().addTo(map);
      const edgesGroup = new L.FeatureGroup().addTo(map);
      facetsGroupRef.current = facetsGroup;
      edgesGroupRef.current = edgesGroup;

      // Restore any previously saved trace.
      if (initialTraceData) {
        for (const facet of initialTraceData.facets) {
          const latlngs = facet.polygon.map(([x, y]) => L.latLng(y, x));
          const layer = L.polygon(latlngs, { color: "#e8590c", weight: 2 }).addTo(facetsGroup);
          layer.bindTooltip(facet.label, { permanent: true, direction: "center" });
          setFacets((prev) => [...prev, { id: nextId(), label: facet.label, pitch: facet.pitch, layer }]);
        }
        for (const edge of initialTraceData.edges) {
          const latlngs = edge.polyline.map(([x, y]) => L.latLng(y, x));
          const layer = L.polyline(latlngs, { color: EDGE_COLORS[edge.type], weight: 3 }).addTo(
            edgesGroup,
          );
          setEdges((prev) => [...prev, { id: nextId(), type: edge.type, layer }]);
        }
      }

      const drawControl = new L.Control.Draw({
        position: "topleft",
        draw: {
          polygon: { shapeOptions: { color: "#e8590c", weight: 2 } },
          polyline: { shapeOptions: { color: "#dc2626", weight: 3 } },
          marker: false,
          circle: false,
          circlemarker: false,
          rectangle: false,
        },
        edit: {
          featureGroup: facetsGroup,
          remove: false,
        },
      });
      map.addControl(drawControl);

      map.on("draw:created", (evt: L.LeafletEvent) => {
        const e = evt as L.DrawEvents.Created;
        const layer = e.layer;

        if (calibratingRef.current) {
          calibratingRef.current = false;
          const polyline = layer as L.Polyline;
          const latlngs = polyline.getLatLngs() as L.LatLng[];
          const pixelLength = latLngsToPixelLength(latlngs);
          const realLength = window.prompt(
            `Real-world length of this line, in feet (measured pixel length: ${pixelLength.toFixed(
              1,
            )}px):`,
          );
          const parsed = realLength ? parseFloat(realLength) : NaN;
          if (parsed > 0) {
            setFeetPerPixel(parsed / pixelLength);
            setMessage(`Scale calibrated: ${(parsed / pixelLength).toFixed(4)} ft/px`);
          }
          return;
        }

        if (e.layerType === "polygon") {
          facetsGroup.addLayer(layer);
          setFacets((prev) => {
            const label = `F${prev.length + 1}`;
            (layer as L.Polygon).bindTooltip(label, { permanent: true, direction: "center" });
            return [...prev, { id: nextId(), label, pitch: 6, layer: layer as L.Polygon }];
          });
        } else if (e.layerType === "polyline") {
          edgesGroup.addLayer(layer);
          const defaultType: EdgeType = "ridge";
          (layer as L.Polyline).setStyle({ color: EDGE_COLORS[defaultType] });
          setEdges((prev) => [...prev, { id: nextId(), type: defaultType, layer: layer as L.Polyline }]);
        }
      });
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCalibration() {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    calibratingRef.current = true;
    setMessage("Draw a line over a feature of known length…");
    new L.Draw.Polyline(map as never, { shapeOptions: { color: "#000000", weight: 2 } }).enable();
  }

  function updateFacetPitch(id: string, pitch: number) {
    setFacets((prev) => prev.map((f) => (f.id === id ? { ...f, pitch } : f)));
  }

  function updateEdgeType(id: string, type: EdgeType) {
    setEdges((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        e.layer.setStyle({ color: EDGE_COLORS[type] });
        return { ...e, type };
      }),
    );
  }

  function removeFacet(id: string) {
    setFacets((prev) => {
      const target = prev.find((f) => f.id === id);
      target?.layer.remove();
      const remaining = prev.filter((f) => f.id !== id);
      return remaining.map((f, i) => {
        const label = `F${i + 1}`;
        f.layer.unbindTooltip();
        f.layer.bindTooltip(label, { permanent: true, direction: "center" });
        return { ...f, label };
      });
    });
  }

  function removeEdge(id: string) {
    setEdges((prev) => {
      const target = prev.find((e) => e.id === id);
      target?.layer.remove();
      return prev.filter((e) => e.id !== id);
    });
  }

  function layerToPolygonPoints(layer: L.Polygon): Point[] {
    const latlngs = (layer.getLatLngs()[0] as L.LatLng[]) ?? [];
    return latlngs.map((ll) => [ll.lng, ll.lat] as Point);
  }

  function layerToPolylinePoints(layer: L.Polyline): Point[] {
    const latlngs = layer.getLatLngs() as L.LatLng[];
    return latlngs.map((ll) => [ll.lng, ll.lat] as Point);
  }

  function buildTraceData(): TraceData | null {
    if (!feetPerPixel) return null;
    return {
      feetPerPixel,
      facets: facets.map((f) => ({
        label: f.label,
        pitch: f.pitch,
        polygon: layerToPolygonPoints(f.layer),
      })),
      edges: edges.map((e) => ({ type: e.type, polyline: layerToPolylinePoints(e.layer) })),
      wasteFactorPct,
      penetrationCount,
    };
  }

  async function saveDraft() {
    const traceData = buildTraceData();
    if (!traceData) {
      setMessage("Calibrate the scale before saving.");
      return;
    }
    setSaving(true);
    try {
      await fetch(`/api/jobs/${jobId}/trace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(traceData),
      });
      setMessage("Draft saved.");
    } finally {
      setSaving(false);
    }
  }

  function computePreview() {
    const traceData = buildTraceData();
    if (!traceData || traceData.facets.length === 0) {
      setMessage("Calibrate the scale and trace at least one facet first.");
      return;
    }
    setMeasurements(computeMeasurements(traceData));
  }

  async function generateReport() {
    const traceData = buildTraceData();
    if (!traceData || traceData.facets.length === 0) {
      setMessage("Calibrate the scale and trace at least one facet first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(traceData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "Failed to generate report");
        return;
      }
      router.push(`/admin/jobs/${jobId}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen">
      <div ref={mapContainerRef} className="flex-1 bg-black" />
      <div className="w-96 overflow-y-auto border-l border-black/10 bg-white p-4 text-sm">
        <h2 className="text-lg font-bold">Trace roof</h2>

        <section className="mt-4 rounded border border-black/10 p-3">
          <h3 className="font-semibold">1. Calibrate scale</h3>
          <p className="mt-1 text-black/60">
            Draw a line over a feature of known length (e.g. a 20ft gutter run).
          </p>
          <button
            onClick={startCalibration}
            className="mt-2 rounded border border-black/20 px-3 py-2 hover:border-accent"
          >
            Draw calibration line
          </button>
          <p className="mt-2 font-medium">
            {feetPerPixel ? `${feetPerPixel.toFixed(4)} ft/px` : "Not calibrated"}
          </p>
        </section>

        <section className="mt-4 rounded border border-black/10 p-3">
          <h3 className="font-semibold">2. Facets</h3>
          <p className="mt-1 text-black/60">Draw polygons on the map using the toolbar.</p>
          <ul className="mt-2 space-y-2">
            {facets.map((f) => (
              <li key={f.id} className="flex items-center gap-2">
                <span className="w-8 font-medium">{f.label}</span>
                <input
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={f.pitch}
                  onChange={(e) => updateFacetPitch(f.id, parseFloat(e.target.value) || 0)}
                  className="w-16 rounded border border-black/20 px-2 py-1"
                />
                <span className="text-black/60">/12</span>
                <button onClick={() => removeFacet(f.id)} className="ml-auto text-black/40 hover:text-black">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4 rounded border border-black/10 p-3">
          <h3 className="font-semibold">3. Edges</h3>
          <p className="mt-1 text-black/60">Draw polylines on the map, then set their type.</p>
          <ul className="mt-2 space-y-2">
            {edges.map((e) => (
              <li key={e.id} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: EDGE_COLORS[e.type] }}
                />
                <select
                  value={e.type}
                  onChange={(ev) => updateEdgeType(e.id, ev.target.value as EdgeType)}
                  className="flex-1 rounded border border-black/20 px-2 py-1"
                >
                  {EDGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <button onClick={() => removeEdge(e.id)} className="text-black/40 hover:text-black">
                  ×
                </button>
              </li>
            ))}
          </ul>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-xs text-black/60">
            {EDGE_TYPES.map((t) => (
              <li key={t} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EDGE_COLORS[t] }} />
                {t.replace("_", " ")}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4 rounded border border-black/10 p-3">
          <h3 className="font-semibold">4. Adjustments</h3>
          <label className="mt-2 flex items-center justify-between">
            Waste factor %
            <input
              type="number"
              min={0}
              value={wasteFactorPct}
              onChange={(e) => setWasteFactorPct(parseFloat(e.target.value) || 0)}
              className="w-20 rounded border border-black/20 px-2 py-1"
            />
          </label>
          <label className="mt-2 flex items-center justify-between">
            Penetration count
            <input
              type="number"
              min={0}
              value={penetrationCount}
              onChange={(e) => setPenetrationCount(parseInt(e.target.value, 10) || 0)}
              className="w-20 rounded border border-black/20 px-2 py-1"
            />
          </label>
        </section>

        {message && <p className="mt-3 text-accent">{message}</p>}

        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={saveDraft}
            disabled={saving}
            className="rounded border border-black/20 px-3 py-2 hover:border-accent disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            onClick={computePreview}
            disabled={!feetPerPixel}
            className="rounded border border-black/20 px-3 py-2 hover:border-accent disabled:opacity-50"
          >
            Compute &amp; preview
          </button>
          <button
            onClick={generateReport}
            disabled={!feetPerPixel || saving}
            className="rounded bg-accent px-3 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            Generate report
          </button>
        </div>

        {measurements && (
          <section className="mt-4 rounded border border-black/10 p-3">
            <h3 className="font-semibold">Preview</h3>
            <table className="mt-2 w-full text-xs">
              <thead>
                <tr className="text-left text-black/60">
                  <th>Facet</th>
                  <th>Pitch</th>
                  <th>Plan ft²</th>
                  <th>Slope ft²</th>
                </tr>
              </thead>
              <tbody>
                {measurements.facets.map((f) => (
                  <tr key={f.label}>
                    <td>{f.label}</td>
                    <td>{f.pitch}/12</td>
                    <td>{f.planAreaSqFt.toFixed(1)}</td>
                    <td>{f.slopeAreaSqFt.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 font-medium">Squares: {measurements.squares}</p>
            <p className="mt-1 text-black/70">
              Shingle bundles: {measurements.materials.shingleBundles} · Underlayment rolls:{" "}
              {measurements.materials.underlaymentRolls}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
