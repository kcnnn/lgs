import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { JobStatus } from "@prisma/client";

const STATUS_COPY: Record<JobStatus, { label: string; percent: number }> = {
  AWAITING_PAYMENT: { label: "Awaiting payment", percent: 5 },
  AWAITING_UPLOAD: { label: "Waiting for your photo upload", percent: 15 },
  PROCESSING: { label: "Processing your drone photos", percent: 40 },
  READY_TO_TRACE: { label: "Photos processed — measurement in progress", percent: 65 },
  TRACING: { label: "Measurement in progress", percent: 75 },
  GENERATING_REPORT: { label: "Generating your report", percent: 90 },
  DELIVERED: { label: "Report delivered", percent: 100 },
  FAILED: { label: "Something went wrong", percent: 100 },
};

export default async function JobStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/jobs/${id}`);
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.userId !== session.user.id) {
    notFound();
  }

  const status = STATUS_COPY[job.status];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold">{job.address}</h1>
      <p className="mt-1 text-sm text-black/60">Job {job.id}</p>

      <div className="mt-8">
        <div className="h-2 overflow-hidden rounded bg-black/10">
          <div
            className={`h-full ${job.status === "FAILED" ? "bg-red-500" : "bg-accent"}`}
            style={{ width: `${status.percent}%` }}
          />
        </div>
        <p className="mt-3 font-medium">{status.label}</p>
        {job.status === "FAILED" && job.failureReason && (
          <p className="mt-1 text-sm text-red-600">{job.failureReason}</p>
        )}
      </div>

      {job.status === "DELIVERED" && (
        <div className="mt-10 space-y-6">
          {job.orthoPngUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- external S3 image, arbitrary aspect ratio
            <img src={job.orthoPngUrl} alt="Orthomosaic" className="w-full rounded-lg border border-black/10" />
          )}
          <div className="flex flex-wrap gap-3">
            {job.reportPdfUrl && (
              <a
                href={job.reportPdfUrl}
                className="rounded bg-accent px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Download PDF report
              </a>
            )}
            {job.lineItemsCsvUrl && (
              <a
                href={job.lineItemsCsvUrl}
                className="rounded border border-black/20 px-4 py-3 text-sm font-semibold hover:border-accent"
              >
                Download line items CSV
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
