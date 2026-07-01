"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processJobQueue } from "@/lib/queue";
import { sendMail, reportDeliveredEmail } from "@/lib/mailer";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("Forbidden");
  }
}

export async function retryJob(formData: FormData) {
  await requireAdmin();
  const jobId = String(formData.get("jobId"));
  await prisma.job.update({
    where: { id: jobId },
    data: { status: "PROCESSING", failureReason: null },
  });
  await processJobQueue.add("process-job", { jobId });
  redirect("/admin");
}

export async function markFailed(formData: FormData) {
  await requireAdmin();
  const jobId = String(formData.get("jobId"));
  await prisma.job.update({
    where: { id: jobId },
    data: { status: "FAILED", failureReason: "Manually marked failed by admin" },
  });
  redirect("/admin");
}

export async function resendDeliveryEmail(formData: FormData) {
  await requireAdmin();
  const jobId = String(formData.get("jobId"));
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId }, include: { user: true } });
  const { subject, html } = reportDeliveredEmail(job.id, job.address);
  await sendMail({ to: job.user.email, subject, html });
  redirect("/admin");
}

export async function grantCredits(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const amount = parseInt(String(formData.get("amount") ?? ""), 10);
  if (!email || !Number.isFinite(amount) || amount === 0) {
    throw new Error("Invalid email or amount");
  }
  await prisma.user.update({
    where: { email },
    data: { credits: { increment: amount } },
  });
  redirect("/admin");
}
