"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useInspection } from "@/components/roof-inspection/InspectionProvider";

export default function ApiSetupPage() {
  const router = useRouter();
  const { apiKey, setApiKey, clearApiKey, hasApiKey } = useInspection();
  const [draft, setDraft] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  // Sync the editable draft whenever the persisted key changes underneath us
  // (e.g. once localStorage finishes hydrating), without overwriting in-progress edits.
  const [syncedApiKey, setSyncedApiKey] = useState(apiKey);
  if (apiKey !== syncedApiKey) {
    setSyncedApiKey(apiKey);
    setDraft(apiKey);
  }

  function handleSave() {
    setApiKey(draft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-5">
          <Link href="/roof-inspection" className="text-xs font-semibold text-gray-400">
            ← ROOF INSPECTION
          </Link>
          <h1 className="text-xl font-black text-gray-900 mt-1">API Key Setup</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Required for AI photo analysis and the final generated report.
          </p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <label className="text-xs font-semibold text-gray-500 block">ChatGPT (OpenAI) API key</label>
          <input
            type="password"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.trim()}
            className="w-full rounded-xl bg-orange-500 text-white py-3 text-sm font-bold disabled:opacity-40"
          >
            {saved ? "Saved ✓" : "Save Key"}
          </button>
          {hasApiKey && (
            <button
              type="button"
              onClick={() => {
                clearApiKey();
                setDraft("");
              }}
              className="w-full rounded-xl border border-gray-200 text-gray-500 py-2.5 text-xs font-semibold"
            >
              Remove saved key
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2 text-sm text-gray-600 leading-relaxed">
          <h2 className="text-sm font-bold text-gray-900">How to get a key</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Visit{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-orange-600 underline"
              >
                platform.openai.com/api-keys
              </a>
            </li>
            <li>Create a new secret key</li>
            <li>Paste it above and save</li>
          </ol>
          <p className="text-xs text-gray-400 pt-1">
            Your key is stored only in this browser&apos;s local storage. It is sent directly from
            your device to OpenAI when running AI analysis — never to any other server.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/roof-inspection")}
          className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600"
        >
          Back to Home
        </button>
      </main>
    </div>
  );
}
