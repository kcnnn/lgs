import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const traceData = await req.json().catch(() => null);
  if (!traceData) {
    return NextResponse.json({ error: "Invalid traceData" }, { status: 400 });
  }

  await prisma.job.update({
    where: { id: job.id },
    data: {
      traceData,
      status: job.status === "READY_TO_TRACE" ? "TRACING" : job.status,
    },
  });

  return NextResponse.json({ ok: true });
}
