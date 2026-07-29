"use client";

import { AIAnalyzeButton } from "@/components/roof-inspection/AIAnalyzeButton";
import { useInspection } from "@/components/roof-inspection/InspectionProvider";
import { PhotoList } from "@/components/roof-inspection/PhotoList";
import { StepShell } from "@/components/roof-inspection/StepShell";
import { getStep } from "@/lib/roof-inspection/steps";

const step = getStep("roof-edge");

export default function RoofEdgePage() {
  const { inspection, updateInspection } = useInspection();
  const data = inspection.roofEdge;

  return (
    <StepShell slug="roof-edge" title={step.title} description={step.description}>
      <div className="space-y-5">
        <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
          <label className="text-xs font-semibold text-gray-500 block">
            Gutter measurement (inches)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={data.gutterMeasurementInches}
            onChange={(e) =>
              updateInspection((d) => ({
                ...d,
                roofEdge: { ...d.roofEdge, gutterMeasurementInches: e.target.value },
              }))
            }
            placeholder="e.g. 5"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Underlayment Photos
          </h2>
          <PhotoList
            photos={data.underlaymentPhotos}
            labelPrefix="Underlayment"
            onChange={(photos) =>
              updateInspection((d) => ({ ...d, roofEdge: { ...d.roofEdge, underlaymentPhotos: photos } }))
            }
          />
        </section>

        <AIAnalyzeButton
          photos={data.underlaymentPhotos}
          instructions={`Review these roof edge underlayment photos. The measured gutter/drip edge is ${
            data.gutterMeasurementInches || "not recorded"
          } inches. Note any issues with underlayment installation, exposure, or edge protection.`}
          value={data.aiAnalysis}
          onResult={(text) =>
            updateInspection((d) => ({ ...d, roofEdge: { ...d.roofEdge, aiAnalysis: text } }))
          }
        />
      </div>
    </StepShell>
  );
}
