"use client";

import { useInspection } from "@/components/roof-inspection/InspectionProvider";
import { StepShell } from "@/components/roof-inspection/StepShell";
import { getStep } from "@/lib/roof-inspection/steps";

const step = getStep("insured-interview");

export default function InsuredInterviewPage() {
  const { inspection, updateInspection } = useInspection();
  const data = inspection.insuredInterview;

  return (
    <StepShell slug="insured-interview" title={step.title} description={step.description}>
      <div className="space-y-4">
        <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
          <h2 className="text-sm font-bold text-gray-900">Damage Discussion</h2>
          <textarea
            rows={4}
            value={data.damageDiscussionNotes}
            onChange={(e) =>
              updateInspection((d) => ({
                ...d,
                insuredInterview: { ...d.insuredInterview, damageDiscussionNotes: e.target.value },
              }))
            }
            placeholder="Summarize what the insured reported: when damage was noticed, prior repairs, leaks, etc."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
          <h2 className="text-sm font-bold text-gray-900">Satellite Verification</h2>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={data.satelliteVerified}
              onChange={(e) =>
                updateInspection((d) => ({
                  ...d,
                  insuredInterview: { ...d.insuredInterview, satelliteVerified: e.target.checked },
                }))
              }
              className="w-4 h-4"
            />
            Roof measurements verified against satellite imagery
          </label>
          <textarea
            rows={2}
            value={data.satelliteNotes}
            onChange={(e) =>
              updateInspection((d) => ({
                ...d,
                insuredInterview: { ...d.insuredInterview, satelliteNotes: e.target.value },
              }))
            }
            placeholder="Notes on discrepancies vs. satellite data…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
          <h2 className="text-sm font-bold text-gray-900">Zelle Payment</h2>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={data.zellePaymentReceived}
              onChange={(e) =>
                updateInspection((d) => ({
                  ...d,
                  insuredInterview: { ...d.insuredInterview, zellePaymentReceived: e.target.checked },
                }))
              }
              className="w-4 h-4"
            />
            Payment received via Zelle
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Amount</label>
              <input
                type="text"
                inputMode="decimal"
                value={data.zelleAmount}
                onChange={(e) =>
                  updateInspection((d) => ({
                    ...d,
                    insuredInterview: { ...d.insuredInterview, zelleAmount: e.target.value },
                  }))
                }
                placeholder="$0.00"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Reference #</label>
              <input
                type="text"
                value={data.zelleReference}
                onChange={(e) =>
                  updateInspection((d) => ({
                    ...d,
                    insuredInterview: { ...d.insuredInterview, zelleReference: e.target.value },
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>
      </div>
    </StepShell>
  );
}
