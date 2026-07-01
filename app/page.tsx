import Link from "next/link";
import { auth } from "@/lib/auth";
import { PricingCards } from "@/components/PricingCards";
import { COMPARISON_ROWS } from "@/lib/comparison";
import testimonials from "@/content/testimonials.json";

const STEPS = [
  {
    n: 1,
    title: "Fly two orbits",
    body: "We give you the flight guide — a 25° and 45° gimbal orbit is all it takes.",
  },
  {
    n: 2,
    title: "Upload ~50 photos",
    body: "Drag and drop your flight photos straight from your drone's SD card.",
  },
  {
    n: 3,
    title: "Get your report in about 2 hours",
    body: "Squares, pitch, and line items — delivered to your inbox the same day.",
  },
];

export default async function LandingPage() {
  const session = await auth();

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Roof measurements from your drone in 30 minutes.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-black/70">
          Upload your flight photos. Get a full measurement report with squares, pitch, and line
          items — same day, not three days.
        </p>
        <Link
          href="/new"
          className="mt-8 inline-block rounded bg-accent px-8 py-4 text-base font-semibold text-white hover:opacity-90"
        >
          Measure My Roof
        </Link>
        <div className="mt-10 overflow-hidden rounded-lg border border-black/10">
          <video
            src="/hero-demo.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full"
            aria-label="RooferClaw Scope product demo"
          />
        </div>
      </section>

      {/* Live 3D demo */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <div className="aspect-video overflow-hidden rounded-lg border border-black/10 bg-black/5">
          {process.env.NEXT_PUBLIC_DEMO_EMBED_URL ? (
            <iframe
              src={process.env.NEXT_PUBLIC_DEMO_EMBED_URL}
              className="h-full w-full"
              allow="fullscreen; xr-spatial-tracking"
              title="Interactive 3D roof model"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-black/40">
              3D demo embed goes here
            </div>
          )}
        </div>
        <p className="mt-4 text-black/60">Spin a real roof we measured. This is what you get.</p>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                {step.n}
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-black/60">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">How we compare</h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10">
                <th className="py-3 text-left"></th>
                <th className="py-3 text-center text-accent">RooferClaw Scope</th>
                <th className="py-3 text-center">EagleView</th>
                <th className="py-3 text-center">Hover</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-black/5">
                  <td className="py-3 font-medium">{row.label}</td>
                  <td className="py-3 text-center font-semibold text-accent">{row.us}</td>
                  <td className="py-3 text-center text-black/60">{row.eagleview}</td>
                  <td className="py-3 text-center text-black/60">{row.hover}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">Pricing</h2>
        <p className="mt-2 text-center text-black/60">Per-report pricing. No subscriptions, no free tier.</p>
        <div className="mt-10">
          <PricingCards isAuthenticated={Boolean(session?.user)} />
        </div>
      </section>

      {/* Founder */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="h-32 w-32 shrink-0 rounded-full bg-black/10" aria-hidden />
          <div>
            <h2 className="text-xl font-bold">Built by a roofer, for roofers</h2>
            <p className="mt-2 text-black/70">Founder bio placeholder — final copy to be supplied.</p>
            <div className="mt-4 inline-block rounded border border-black/10 px-3 py-1 text-xs text-black/50">
              FAA Part 107 badge placeholder
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {Array.isArray(testimonials) && testimonials.length >= 3 && (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold">What contractors say</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {(testimonials as { quote: string; name: string; company?: string }[]).map((t, i) => (
              <blockquote key={i} className="rounded-lg border border-black/10 p-6 text-sm">
                <p>&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 font-medium text-black/60">
                  {t.name}
                  {t.company ? `, ${t.company}` : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-black/10 py-8 text-center text-sm text-black/60">
        <p>
          Built by a roof inspector who got tired of waiting three days for measurements. ·{" "}
          <a
            href="https://x.com/intent/tweet?text=Roof%20measurements%20from%20your%20drone%20in%2030%20minutes%20%E2%80%94%20RooferClaw%20Scope"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Share on X
          </a>
        </p>
      </footer>
    </div>
  );
}
