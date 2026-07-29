"use client";

import { AIAnalyzeButton } from "@/components/roof-inspection/AIAnalyzeButton";
import { useInspection } from "@/components/roof-inspection/InspectionProvider";
import { PhotoSlot } from "@/components/roof-inspection/PhotoSlot";
import { StepShell } from "@/components/roof-inspection/StepShell";
import { getStep } from "@/lib/roof-inspection/steps";
import type { Photo } from "@/lib/roof-inspection/types";

const step = getStep("ridge-inspection");

export default function RidgeInspectionPage() {
  const { inspection, updateInspection } = useInspection();
  const data = inspection.ridgeInspection;

  function setPhoto(key: "ridgeCloseup" | "underRidge", photo: Photo) {
    updateInspection((d) => ({
      ...d,
      ridgeInspection: { ...d.ridgeInspection, [key]: photo },
    }));
  }

  return (
    <StepShell slug="ridge-inspection" title={step.title} description={step.description}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <PhotoSlot photo={data.ridgeCloseup} onChange={(p) => setPhoto("ridgeCloseup", p)} />
          <PhotoSlot photo={data.underRidge} onChange={(p) => setPhoto("underRidge", p)} />
        </div>

        <AIAnalyzeButton
          photos={[data.ridgeCloseup, data.underRidge]}
          instructions="Review this ridge closeup photo and under-ridge detail photo of a roof. Note the ridge cap condition, fastening, sealant, ventilation, and any signs of wind or hail damage."
          value={data.aiAnalysis}
          onResult={(text) =>
            updateInspection((d) => ({
              ...d,
              ridgeInspection: { ...d.ridgeInspection, aiAnalysis: text },
            }))
          }
        />
      </div>
    </StepShell>
  );
}
