"use client";

import { AIAnalyzeButton } from "@/components/roof-inspection/AIAnalyzeButton";
import { useInspection } from "@/components/roof-inspection/InspectionProvider";
import { PhotoSlot } from "@/components/roof-inspection/PhotoSlot";
import { StepShell } from "@/components/roof-inspection/StepShell";
import { getStep } from "@/lib/roof-inspection/steps";
import type { DamageSeverity } from "@/lib/roof-inspection/types";

const step = getStep("hail-test-square");

const SEVERITY_OPTIONS: { value: DamageSeverity; label: string }[] = [
  { value: "none", label: "No damage" },
  { value: "minor", label: "Minor" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

export default function HailTestSquarePage() {
  const { inspection, updateInspection } = useInspection();
  const data = inspection.hailTestSquare;

  return (
    <StepShell slug="hail-test-square" title={step.title} description={step.description}>
      <div className="space-y-4">
        <p className="text-xs text-gray-500">
          Mark out a 10&apos;x10&apos; test square on a representative roof slope and photograph it.
        </p>

        <PhotoSlot
          photo={data.squarePhoto}
          onChange={(p) =>
            updateInspection((d) => ({ ...d, hailTestSquare: { ...d.hailTestSquare, squarePhoto: p } }))
          }
        />

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Hail hits counted</label>
            <input
              type="number"
              inputMode="numeric"
              value={data.hailHitCount}
              onChange={(e) =>
                updateInspection((d) => ({
                  ...d,
                  hailTestSquare: { ...d.hailTestSquare, hailHitCount: e.target.value },
                }))
              }
              placeholder="e.g. 8"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Damage severity</label>
            <div className="grid grid-cols-2 gap-2">
              {SEVERITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    updateInspection((d) => ({
                      ...d,
                      hailTestSquare: { ...d.hailTestSquare, damageSeverity: opt.value },
                    }))
                  }
                  className={`rounded-lg border py-2 text-sm font-semibold transition ${
                    data.damageSeverity === opt.value
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Notes</label>
            <textarea
              rows={3}
              value={data.notes}
              onChange={(e) =>
                updateInspection((d) => ({ ...d, hailTestSquare: { ...d.hailTestSquare, notes: e.target.value } }))
              }
              placeholder="Hit pattern, granule loss, mat exposure, bruising…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <AIAnalyzeButton
          photos={[data.squarePhoto]}
          instructions={`Assess this 10x10 foot hail test square photo for hail damage using standard field methodology. The inspector counted ${
            data.hailHitCount || "an unspecified number of"
          } hits and assessed severity as "${data.damageSeverity}". Confirm or challenge that assessment based on what's visible (bruising, granule loss, mat exposure, spatter pattern, functional vs. cosmetic damage).`}
          value={data.aiAnalysis}
          onResult={(text) =>
            updateInspection((d) => ({ ...d, hailTestSquare: { ...d.hailTestSquare, aiAnalysis: text } }))
          }
        />
      </div>
    </StepShell>
  );
}
