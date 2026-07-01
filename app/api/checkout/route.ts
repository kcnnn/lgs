import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, CREDIT_PACKS, isCreditPack } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const pack = body?.pack;
  if (typeof pack !== "string" || !isCreditPack(pack)) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  const packConfig = CREDIT_PACKS[pack];
  const priceId = process.env[packConfig.priceEnv];
  if (!priceId) {
    return NextResponse.json({ error: "Pricing not configured" }, { status: 500 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.PUBLIC_SITE_URL}/new?checkout=success`,
    cancel_url: `${process.env.PUBLIC_SITE_URL}/new?checkout=cancelled`,
    metadata: {
      userId: session.user.id,
      pack,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
