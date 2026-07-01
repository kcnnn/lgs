import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import sharp from "sharp";
import { prisma } from "../lib/prisma";
import { s3ListKeys, s3GetObjectStream, s3UploadStream } from "../lib/s3";
import {
  webodmAuthenticate,
  webodmCreateProject,
  webodmCreateTask,
  webodmGetTask,
  webodmDownloadAsset,
  TASK_STATUS,
} from "../lib/webodm";
import { sendMail, jobReadyToTraceEmail, jobFailedEmail } from "../lib/mailer";

const POLL_INTERVAL_MS = 30_000;
const MAX_PROCESSING_MS = 3 * 60 * 60 * 1000;
const MAX_POLL_ATTEMPTS = Math.ceil(MAX_PROCESSING_MS / POLL_INTERVAL_MS);

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processJob(jobId: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });

  try {
    const token = await webodmAuthenticate();
    const project = await webodmCreateProject(token, `RooferClaw ${job.id}`);

    const photoKeys = await s3ListKeys(`${job.s3Prefix}/photos/`);
    if (photoKeys.length === 0) {
      throw new Error("No photos found for job");
    }

    const images = await Promise.all(
      photoKeys.map(async (key) => ({
        filename: key.split("/").pop() ?? key,
        stream: await s3GetObjectStream(key),
      })),
    );

    const task = await webodmCreateTask(token, project.id, `RooferClaw ${job.id}`, images);

    await prisma.job.update({
      where: { id: job.id },
      data: { webodmProjectId: String(project.id), webodmTaskId: task.id },
    });

    let completed = false;
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await sleep(POLL_INTERVAL_MS);
      const status = await webodmGetTask(token, project.id, task.id);
      const code = status.status?.code;
      if (code === TASK_STATUS.COMPLETED) {
        completed = true;
        break;
      }
      if (code === TASK_STATUS.FAILED || code === TASK_STATUS.CANCELED) {
        throw new Error(status.last_error ?? `WebODM task failed with status code ${code}`);
      }
    }
    if (!completed) {
      throw new Error("WebODM task did not complete within 3 hours");
    }

    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), `rc-${job.id}-`));
    try {
      const orthoTifPath = path.join(tmpDir, "orthophoto.tif");
      const dsmTifPath = path.join(tmpDir, "dsm.tif");
      const orthoPngPath = path.join(tmpDir, "orthophoto.png");

      const orthoStream = await webodmDownloadAsset(token, project.id, task.id, "orthophoto.tif");
      await pipeline(orthoStream, fs.createWriteStream(orthoTifPath));

      const dsmStream = await webodmDownloadAsset(token, project.id, task.id, "dsm.tif");
      await pipeline(dsmStream, fs.createWriteStream(dsmTifPath));

      await sharp(orthoTifPath, { limitInputPixels: false }).png().toFile(orthoPngPath);

      const orthoUrl = await s3UploadStream(
        `${job.s3Prefix}/processed/orthophoto.tif`,
        fs.createReadStream(orthoTifPath),
        "image/tiff",
      );
      const dsmUrl = await s3UploadStream(
        `${job.s3Prefix}/processed/dsm.tif`,
        fs.createReadStream(dsmTifPath),
        "image/tiff",
      );
      const orthoPngUrl = await s3UploadStream(
        `${job.s3Prefix}/processed/orthophoto.png`,
        fs.createReadStream(orthoPngPath),
        "image/png",
      );

      await prisma.job.update({
        where: { id: job.id },
        data: { orthoUrl, dsmUrl, orthoPngUrl, status: "READY_TO_TRACE" },
      });

      const recipients = adminEmails();
      if (recipients.length > 0) {
        const { subject, html } = jobReadyToTraceEmail(job.id, job.address);
        await sendMail({ to: recipients, subject, html });
      }
    } finally {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "FAILED", failureReason: reason },
    });

    const recipients = adminEmails();
    if (recipients.length > 0) {
      const { subject, html } = jobFailedEmail(job.id, job.address, reason);
      await sendMail({ to: recipients, subject, html });
    }
    throw err;
  }
}
