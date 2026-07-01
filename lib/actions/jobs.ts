"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createJob(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/new");
  }

  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!address) {
    throw new Error("Address is required");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (user.credits < 1) {
    redirect("/new");
  }

  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({
      data: {
        userId: user.id,
        address,
        notes: notes || null,
        status: "AWAITING_UPLOAD",
        s3Prefix: `jobs/${randomUUID()}`,
      },
    });
    await tx.user.update({ where: { id: user.id }, data: { credits: { decrement: 1 } } });
    return created;
  });

  redirect(`/jobs/${job.id}/upload`);
}
