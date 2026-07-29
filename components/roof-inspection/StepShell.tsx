"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { getNextStep, getPrevStep, getStep, getStepPath, TOTAL_STEPS } from "@/lib/roof-inspection/steps";
import type { StepSlug } from "@/lib/roof-inspection/types";

type StepShellProps = {
  slug: StepSlug;
  title: string;
  description: string;
  children: ReactNode;
  canGoNext?: boolean;
  nextLabel?: string;
};

export function StepShell({
  slug,
  title,
  description,
  children,
  canGoNext = true,
  nextLabel,
}: StepShellProps) {
  const router = useRouter();
  const current = Math.round((getStep(slug).index / TOTAL_STEPS) * 100);
  const prev = getPrevStep(slug);
  const next = getNextStep(slug);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/roof-inspection"
              className="text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              ROOF INSPECTION
            </Link>
            <span className="text-xs font-medium text-gray-400">{current}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${current}%` }}
            />
          </div>
          <h1 className="text-xl font-black text-gray-900 mt-3 leading-tight">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-5">{children}</main>

      <footer className="sticky bottom-0 bg-white border-t border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-3 flex gap-3">
          {prev ? (
            <button
              type="button"
              onClick={() => router.push(getStepPath(prev.slug))}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 active:scale-[0.98] transition"
            >
              Back
            </button>
          ) : (
            <Link
              href="/roof-inspection"
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 text-center active:scale-[0.98] transition"
            >
              Home
            </Link>
          )}
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() =>
              router.push(next ? getStepPath(next.slug) : "/roof-inspection/report")
            }
            className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition"
          >
            {nextLabel ?? (next ? "Next" : "Finish → Report")}
          </button>
        </div>
      </footer>
    </div>
  );
}
