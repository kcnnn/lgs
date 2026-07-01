import { auth } from "@/lib/auth";
import { sendMagicLink } from "@/lib/actions/auth";
import { createJob } from "@/lib/actions/jobs";
import { PricingCards } from "@/components/PricingCards";

export default async function NewJobPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-sm px-6 py-24">
        <h1 className="text-2xl font-bold">Measure my roof</h1>
        <p className="mt-2 text-black/70">
          Enter your email and we&apos;ll send you a login link to get started.
        </p>
        <form action={sendMagicLink} className="mt-8 flex flex-col gap-3">
          <input type="hidden" name="callbackUrl" value="/new" />
          <input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            className="rounded border border-black/20 px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Email me a login link
          </button>
        </form>
      </div>
    );
  }

  if (session.user.credits < 1) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="text-2xl font-bold">Buy report credits</h1>
        <p className="mt-2 text-black/70">
          You need at least one report credit to start a new job.
        </p>
        <div className="mt-10">
          <PricingCards isAuthenticated />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-24">
      <h1 className="text-2xl font-bold">Measure my roof</h1>
      <p className="mt-2 text-black/70">
        You have {session.user.credits} report credit{session.user.credits === 1 ? "" : "s"}. This
        job will use one.
      </p>
      <form action={createJob} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Property address
          <input
            type="text"
            name="address"
            required
            placeholder="123 Main St, Springfield, IL"
            className="rounded border border-black/20 px-4 py-3 text-sm font-normal focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Notes (optional)
          <textarea
            name="notes"
            rows={3}
            placeholder="e.g. hail claim, north slope"
            className="rounded border border-black/20 px-4 py-3 text-sm font-normal focus:border-accent focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Continue to upload
        </button>
      </form>
    </div>
  );
}
