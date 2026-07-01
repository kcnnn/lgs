import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { TraceData } from "@/lib/measure";
import { TraceMap } from "@/components/TraceMap";

export default async function AdminTracePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || !job.orthoPngUrl) {
    notFound();
  }

  return (
    <TraceMap
      jobId={job.id}
      orthoPngUrl={job.orthoPngUrl}
      initialTraceData={(job.traceData as TraceData | null) ?? null}
    />
  );
}
