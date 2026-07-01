import { sendMagicLink } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-2 text-black/70">
        Enter your email and we&apos;ll send you a login link. No password needed.
      </p>
      <form action={sendMagicLink} className="mt-8 flex flex-col gap-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/new"} />
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
