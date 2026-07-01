import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processJobQueue } from "@/lib/queue";

const MIN_PHOTOS = 20;
const MAX_PHOTOS = 300;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (job.status !== "AWAITING_UPLOAD") {
    return NextResponse.json({ error: "Job is not awaiting upload" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const photoCount = Number(body?.photoCount);
  if (!Number.isInteger(photoCount) || photoCount < MIN_PHOTOS || photoCount > MAX_PHOTOS) {
    return NextResponse.json(
      { error: `photoCount must be between ${MIN_PHOTOS} and ${MAX_PHOTOS}` },
      { status: 400 },
    );
  }

  await prisma.job.update({
    where: { id: job.id },
    data: { photoCount, status: "PROCESSING" },
  });

  await processJobQueue.add("process-job", { jobId: job.id });

  return NextResponse.json({ ok: true });
}
