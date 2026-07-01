"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CREDIT_PACKS, type CreditPack } from "@/lib/pricing";

const ORDER: { pack: CreditPack; cta: string; note?: string; featured?: boolean }[] = [
  { pack: "single", cta: "Buy 1 report" },
  { pack: "five", cta: "Buy 5 reports", note: "$30 per report", featured: true },
  { pack: "twenty", cta: "Buy 20 reports", note: "$25 per report" },
];

export function PricingCards({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [loadingPack, setLoadingPack] = useState<CreditPack | null>(null);
  const router = useRouter();

  async function handleBuy(pack: CreditPack) {
    if (!isAuthenticated) {
      router.push("/login?callbackUrl=/new");
      return;
    }
    setLoadingPack(pack);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoadingPack(null);
    }
  }

  return (
    <div id="pricing" className="grid gap-6 sm:grid-cols-3">
      {ORDER.map(({ pack, cta, note, featured }) => {
        const config = CREDIT_PACKS[pack];
        return (
          <div
            key={pack}
            className={`flex flex-col rounded-lg border p-6 ${
              featured ? "border-accent shadow-lg shadow-accent/10" : "border-black/10"
            }`}
          >
            <h3 className="text-lg font-semibold">{config.label}</h3>
            <p className="mt-2 text-3xl font-bold">
              ${config.price}
              {note && <span className="ml-2 text-sm font-normal text-black/60">{note}</span>}
            </p>
            <button
              onClick={() => handleBuy(pack)}
              disabled={loadingPack === pack}
              className="mt-6 rounded bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loadingPack === pack ? "Redirecting…" : cta}
            </button>
          </div>
        );
      })}
    </div>
  );
}
