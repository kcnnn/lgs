import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMeasurements, type TraceData } from "@/lib/measure";
import { generateReportQueue } from "@/lib/queue";

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

  const traceData = (await req.json().catch(() => null)) as TraceData | null;
  if (!traceData || !traceData.feetPerPixel || traceData.facets.length === 0) {
    return NextResponse.json(
      { error: "Calibrate the scale and trace at least one facet before generating a report" },
      { status: 400 },
    );
  }

  const measurements = computeMeasurements(traceData);

  await prisma.job.update({
    where: { id: job.id },
    data: { traceData, measurements, status: "GENERATING_REPORT" },
  });

  await generateReportQueue.add("generate-report", { jobId: job.id });

  return NextResponse.json({ ok: true, measurements });
}
