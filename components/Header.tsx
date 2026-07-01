import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          RooferClaw <span className="text-accent">Scope</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/#pricing" className="hover:text-accent">
            Pricing
          </Link>
          <Link href="/flight-guide" className="hover:text-accent">
            Flight Guide
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-black/70">
                {session.user.credits} credit{session.user.credits === 1 ? "" : "s"}
              </span>
              {session.user.isAdmin && (
                <Link href="/admin" className="hover:text-accent">
                  Admin
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="hover:text-accent">
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="hover:text-accent">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
