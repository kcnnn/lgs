import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, CREDIT_PACKS, isCreditPack } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const pack = session.metadata?.pack;

    if (userId && pack && isCreditPack(pack)) {
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: CREDIT_PACKS[pack].credits } },
      });
    }
  }

  return NextResponse.json({ received: true });
}
