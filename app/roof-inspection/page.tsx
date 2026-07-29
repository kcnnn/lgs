"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInspection } from "@/components/roof-inspection/InspectionProvider";
import { STEPS } from "@/lib/roof-inspection/steps";

export default function RoofInspectionHomePage() {
  const router = useRouter();
  const { inspection, updateInspection, hasApiKey, resetInspection } = useInspection();

  function handleStart() {
    router.push(hasApiKey ? "/roof-inspection/elevation-photos" : "/roof-inspection/api-setup");
  }

  const { property } = inspection;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-orange-500 tracking-wide">FIELD TOOL</p>
            <h1 className="text-xl font-black text-gray-900">Roof Inspection Wizard</h1>
          </div>
          <Link
            href="/roof-inspection/api-setup"
            className="text-xs font-semibold text-gray-400 hover:text-gray-600"
          >
            API Setup
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <p className="text-sm text-gray-500 leading-relaxed">
          A 7-step guided inspection with AI-assisted photo analysis. Enter the property details
          below, then start the inspection — everything is saved on this device as you go.
        </p>

        <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-sm font-bold text-gray-900">Inspection Details</h2>
          <Field
            label="Insured name"
            value={property.insuredName}
            onChange={(v) => updateInspection((d) => ({ ...d, property: { ...d.property, insuredName: v } }))}
          />
          <Field
            label="Property address"
            value={property.propertyAddress}
            onChange={(v) =>
              updateInspection((d) => ({ ...d, property: { ...d.property, propertyAddress: v } }))
            }
          />
          <Field
            label="Claim number"
            value={property.claimNumber}
            onChange={(v) => updateInspection((d) => ({ ...d, property: { ...d.property, claimNumber: v } }))}
          />
          <Field
            label="Inspector name"
            value={property.inspectorName}
            onChange={(v) =>
              updateInspection((d) => ({ ...d, property: { ...d.property, inspectorName: v } }))
            }
          />
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Inspection date</label>
            <input
              type="date"
              value={property.inspectionDate}
              onChange={(e) =>
                updateInspection((d) => ({
                  ...d,
                  property: { ...d.property, inspectionDate: e.target.value },
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
        </section>

        {!hasApiKey && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
            You&apos;ll be asked to add a ChatGPT API key before starting so AI photo analysis and the
            final report can run.
          </div>
        )}

        <button
          type="button"
          onClick={handleStart}
          className="w-full rounded-xl bg-orange-500 text-white py-4 text-base font-bold active:scale-[0.98] transition"
        >
          START
        </button>

        <section className="pt-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
            Inspection Steps
          </h2>
          <ol className="space-y-1.5">
            {STEPS.map((step) => (
              <li key={step.slug} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-xs font-bold text-gray-500 shrink-0">
                  {step.index}
                </span>
                {step.title}
              </li>
            ))}
          </ol>
        </section>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            ← Back to LongevityScore
          </Link>
          <button
            type="button"
            onClick={() => {
              if (confirm("Start over? This clears all photos and notes on this device.")) {
                resetInspection();
              }
            }}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Start over
          </button>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />
    </div>
  );
}
