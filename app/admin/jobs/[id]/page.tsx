import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Measurements } from "@/lib/measure";

export default async function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { user: true } });
  if (!job) notFound();

  const measurements = job.measurements as unknown as Measurements | null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin" className="text-sm text-accent hover:underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{job.address}</h1>
      <p className="text-black/60">
        {job.user.email} · Status: {job.status} · {job.photoCount} photos
      </p>

      <div className="mt-6 flex gap-4 text-sm">
        <Link href={`/admin/jobs/${job.id}/trace`} className="text-accent hover:underline">
          Open tracing tool
        </Link>
        <Link href={`/jobs/${job.id}`} className="text-accent hover:underline">
          View customer page
        </Link>
      </div>

      {measurements && (
        <div className="mt-8">
          <h2 className="font-semibold">Measurements</h2>
          <p className="mt-2 text-sm">
            Squares: {measurements.squares} · Shingle bundles: {measurements.materials.shingleBundles}
          </p>
        </div>
      )}

      {job.reportPdfUrl && (
        <div className="mt-6 flex gap-3">
          <a href={job.reportPdfUrl} className="text-accent hover:underline">
            Download PDF
          </a>
          {job.lineItemsCsvUrl && (
            <a href={job.lineItemsCsvUrl} className="text-accent hover:underline">
              Download CSV
            </a>
          )}
        </div>
      )}
    </div>
  );
}
