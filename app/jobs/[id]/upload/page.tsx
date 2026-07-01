import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UploadDropzone } from "@/components/UploadDropzone";

export default async function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/jobs/${id}/upload`);
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.userId !== session.user.id) {
    notFound();
  }

  if (job.status !== "AWAITING_UPLOAD") {
    redirect(`/jobs/${id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold">Upload drone photos</h1>
      <p className="mt-2 text-black/70">{job.address}</p>
      <div className="mt-8">
        <UploadDropzone jobId={job.id} />
      </div>
    </div>
  );
}
