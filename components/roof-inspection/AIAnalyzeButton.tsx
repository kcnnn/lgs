"use client";

import Link from "next/link";
import { useState } from "react";
import { analyzePhotos, OpenAIRequestError } from "@/lib/roof-inspection/openai";
import type { Photo } from "@/lib/roof-inspection/types";
import { useInspection } from "./InspectionProvider";

type AIAnalyzeButtonProps = {
  photos: Photo[];
  instructions: string;
  value: string | null;
  onResult: (text: string) => void;
};

export function AIAnalyzeButton({ photos, instructions, value, onResult }: AIAnalyzeButtonProps) {
  const { apiKey, hasApiKey } = useInspection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasPhotos = photos.some((p) => p.dataUrl);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzePhotos(apiKey, photos, instructions);
      onResult(result);
    } catch (err) {
      setError(err instanceof OpenAIRequestError ? err.message : "AI analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!hasApiKey) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
        Add your ChatGPT API key on the{" "}
        <Link href="/roof-inspection/api-setup" className="font-semibold text-orange-600 underline">
          setup page
        </Link>{" "}
        to enable AI photo analysis.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={runAnalysis}
        disabled={loading || !hasPhotos}
        className="w-full rounded-xl bg-gray-900 text-white py-3 text-sm font-semibold disabled:opacity-40"
      >
        {loading ? "Analyzing…" : value ? "Re-analyze with AI" : "Analyze with AI"}
      </button>
      {!hasPhotos && (
        <p className="text-xs text-gray-400">Capture a photo above before running AI analysis.</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {value && (
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 whitespace-pre-wrap">
          {value}
        </div>
      )}
    </div>
  );
}
