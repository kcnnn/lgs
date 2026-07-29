"use client";

import { AIAnalyzeButton } from "@/components/roof-inspection/AIAnalyzeButton";
import { useInspection } from "@/components/roof-inspection/InspectionProvider";
import { PhotoSlot } from "@/components/roof-inspection/PhotoSlot";
import { StepShell } from "@/components/roof-inspection/StepShell";
import { getStep } from "@/lib/roof-inspection/steps";
import type { Photo } from "@/lib/roof-inspection/types";

const step = getStep("elevation-photos");

export default function ElevationPhotosPage() {
  const { inspection, updateInspection } = useInspection();
  const data = inspection.elevationPhotos;

  function setElevation(key: "front" | "right" | "rear" | "left", photo: Photo) {
    updateInspection((d) => ({
      ...d,
      elevationPhotos: { ...d.elevationPhotos, [key]: photo },
    }));
  }

  const allPhotos = [data.front, data.right, data.rear, data.left];
  const capturedCount = allPhotos.filter((p) => p.dataUrl).length;

  return (
    <StepShell slug="elevation-photos" title={step.title} description={step.description}>
      <div className="space-y-4">
        <p className="text-xs font-semibold text-gray-400">{capturedCount} of 4 captured</p>
        <div className="grid grid-cols-2 gap-3">
          <PhotoSlot photo={data.front} onChange={(p) => setElevation("front", p)} />
          <PhotoSlot photo={data.right} onChange={(p) => setElevation("right", p)} />
          <PhotoSlot photo={data.rear} onChange={(p) => setElevation("rear", p)} />
          <PhotoSlot photo={data.left} onChange={(p) => setElevation("left", p)} />
        </div>

        <AIAnalyzeButton
          photos={allPhotos}
          instructions="Review these four elevation photos (front, right, rear, left) of a residential property. Note any visible siding, gutter, window, or structural issues relevant to a roof insurance inspection."
          value={data.aiAnalysis}
          onResult={(text) =>
            updateInspection((d) => ({
              ...d,
              elevationPhotos: { ...d.elevationPhotos, aiAnalysis: text },
            }))
          }
        />
      </div>
    </StepShell>
  );
}
