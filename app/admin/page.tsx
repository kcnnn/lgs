import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { JobStatus } from "@prisma/client";
import { retryJob, markFailed, resendDeliveryEmail, grantCredits } from "@/lib/actions/admin";

const ALL_STATUSES: JobStatus[] = [
  "AWAITING_PAYMENT",
  "AWAITING_UPLOAD",
  "PROCESSING",
  "READY_TO_TRACE",
  "TRACING",
  "GENERATING_REPORT",
  "DELIVERED",
  "FAILED",
];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status && ALL_STATUSES.includes(status as JobStatus) ? (status as JobStatus) : undefined;

  const jobs = await prisma.job.findMany({
    where: filter ? { status: filter } : undefined,
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin"
          className={`rounded border px-3 py-1 ${!filter ? "border-accent text-accent" : "border-black/20"}`}
        >
          All
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin?status=${s}`}
            className={`rounded border px-3 py-1 ${filter === s ? "border-accent text-accent" : "border-black/20"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-black/60">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Address</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Photos</th>
              <th className="py-2 pr-4">Links</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-black/5">
                <td className="py-2 pr-4 font-mono text-xs">{job.id}</td>
                <td className="py-2 pr-4">{job.user.email}</td>
                <td className="py-2 pr-4">{job.address}</td>
                <td className="py-2 pr-4">{job.status}</td>
                <td className="py-2 pr-4">{job.createdAt.toLocaleDateString()}</td>
                <td className="py-2 pr-4">{job.photoCount}</td>
                <td className="py-2 pr-4">
                  <div className="flex flex-col gap-1">
                    <Link href={`/admin/jobs/${job.id}/trace`} className="text-accent hover:underline">
                      Trace
                    </Link>
                    <Link href={`/jobs/${job.id}`} className="text-accent hover:underline">
                      Customer page
                    </Link>
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <div className="flex flex-col gap-1">
                    {job.status === "FAILED" && (
                      <form action={retryJob}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button className="text-left text-accent hover:underline">Retry WebODM job</button>
                      </form>
                    )}
                    {job.status !== "FAILED" && job.status !== "DELIVERED" && (
                      <form action={markFailed}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button className="text-left text-accent hover:underline">Mark failed</button>
                      </form>
                    )}
                    {job.status === "DELIVERED" && (
                      <form action={resendDeliveryEmail}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button className="text-left text-accent hover:underline">Resend email</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 max-w-sm rounded border border-black/10 p-4">
        <h2 className="font-semibold">Grant credits</h2>
        <form action={grantCredits} className="mt-3 flex flex-col gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="customer@company.com"
            className="rounded border border-black/20 px-3 py-2 text-sm"
          />
          <input
            type="number"
            name="amount"
            required
            placeholder="Credits to add"
            className="rounded border border-black/20 px-3 py-2 text-sm"
          />
          <button className="rounded bg-accent px-3 py-2 text-sm font-semibold text-white hover:opacity-90">
            Grant credits
          </button>
        </form>
      </div>
    </div>
  );
}
