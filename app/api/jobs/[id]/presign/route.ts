import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { presignPutUrl } from "@/lib/s3";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_FILE_BYTES = 30 * 1024 * 1024;
const MAX_BATCH_SIZE = 50;

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
  const files = body?.files;
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_BATCH_SIZE) {
    return NextResponse.json({ error: `Batches must contain 1-${MAX_BATCH_SIZE} files` }, { status: 400 });
  }

  const uploads = [];
  for (const file of files) {
    const { name, type, size } = file ?? {};
    if (typeof name !== "string" || !ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ error: `${name}: only .jpg/.jpeg/.png allowed` }, { status: 400 });
    }
    if (typeof size !== "number" || size <= 0 || size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `${name}: exceeds 30MB limit` }, { status: 400 });
    }
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${job.s3Prefix}/photos/${crypto.randomUUID()}-${safeName}`;
    const url = await presignPutUrl(key, type);
    uploads.push({ name, key, url });
  }

  return NextResponse.json({ uploads });
}
