"use client";

import { AIAnalyzeButton } from "@/components/roof-inspection/AIAnalyzeButton";
import { useInspection } from "@/components/roof-inspection/InspectionProvider";
import { PhotoSlot } from "@/components/roof-inspection/PhotoSlot";
import { StepShell } from "@/components/roof-inspection/StepShell";
import { getStep } from "@/lib/roof-inspection/steps";
import type { Photo } from "@/lib/roof-inspection/types";

const step = getStep("roof-overview");

export default function RoofOverviewPage() {
  const { inspection, updateInspection } = useInspection();
  const data = inspection.roofOverview;
  const capturedCount = data.photos.filter((p) => p.dataUrl).length;

  function setPhoto(index: number, photo: Photo) {
    updateInspection((d) => ({
      ...d,
      roofOverview: {
        ...d.roofOverview,
        photos: d.roofOverview.photos.map((p, i) => (i === index ? photo : p)),
      },
    }));
  }

  return (
    <StepShell slug="roof-overview" title={step.title} description={step.description}>
      <div className="space-y-4">
        <p className="text-xs font-semibold text-gray-400">{capturedCount} of 8 captured</p>
        <p className="text-xs text-gray-500">
          Walk the perimeter and capture 8 photos in clockwise order, overlapping each shot with the
          last.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {data.photos.map((photo, i) => (
            <PhotoSlot key={photo.id} photo={photo} onChange={(p) => setPhoto(i, p)} />
          ))}
        </div>

        <AIAnalyzeButton
          photos={data.photos}
          instructions="Review these clockwise roof overview photos. Summarize overall roof condition, material type, slope, and any visible damage, wear, or maintenance issues across the surface."
          value={data.aiAnalysis}
          onResult={(text) =>
            updateInspection((d) => ({
              ...d,
              roofOverview: { ...d.roofOverview, aiAnalysis: text },
            }))
          }
        />
      </div>
    </StepShell>
  );
}
