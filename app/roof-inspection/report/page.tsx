"use client";

import Link from "next/link";
import { useState } from "react";
import { useInspection } from "@/components/roof-inspection/InspectionProvider";
import { generateReport, OpenAIRequestError } from "@/lib/roof-inspection/openai";

export default function ReportPage() {
  const { inspection, updateInspection, apiKey, hasApiKey } = useInspection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const report = await generateReport(apiKey, inspection);
      updateInspection((d) => ({ ...d, finalReport: report }));
    } catch (err) {
      setError(err instanceof OpenAIRequestError ? err.message : "Report generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!inspection.finalReport) return;
    void navigator.clipboard.writeText(inspection.finalReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    if (!inspection.finalReport) return;
    const blob = new Blob([inspection.finalReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const addressSlug = inspection.property.propertyAddress
      ? inspection.property.propertyAddress.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      : "report";
    a.download = `roof-inspection-${addressSlug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-5">
          <Link href="/roof-inspection/insured-interview" className="text-xs font-semibold text-gray-400">
            ← BACK
          </Link>
          <h1 className="text-xl font-black text-gray-900 mt-1">Inspection Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-generated report compiled from every step of this inspection.
          </p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {!hasApiKey && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
            Add your ChatGPT API key on the{" "}
            <Link href="/roof-inspection/api-setup" className="font-semibold underline">
              setup page
            </Link>{" "}
            to generate the report.
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !hasApiKey}
          className="w-full rounded-xl bg-orange-500 text-white py-4 text-base font-bold disabled:opacity-40 active:scale-[0.98] transition"
        >
          {loading ? "Generating report…" : inspection.finalReport ? "Regenerate Report" : "Generate AI Report"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {inspection.finalReport && (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600"
              >
                Download
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600"
              >
                Print
              </button>
            </div>

            <article className="bg-white rounded-2xl border border-gray-100 p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {inspection.finalReport}
            </article>
          </>
        )}
      </main>
    </div>
  );
}
