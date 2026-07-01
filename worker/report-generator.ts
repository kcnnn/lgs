import puppeteer from "puppeteer";
import { prisma } from "../lib/prisma";
import { s3PutBuffer } from "../lib/s3";
import { sendMail, reportDeliveredEmail } from "../lib/mailer";
import type { Measurements, TraceData } from "../lib/measure";
import { buildOrthoOverlayDataUri } from "./overlay";
import { buildReportHtml } from "./report-template";
import { buildLineItemsCsv } from "./csv";

export async function generateReport(jobId: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId }, include: { user: true } });

  if (!job.orthoPngUrl || !job.traceData || !job.measurements) {
    throw new Error("Job is missing ortho image, trace data, or measurements");
  }

  const trace = job.traceData as unknown as TraceData;
  const measurements = job.measurements as unknown as Measurements;

  const orthoOverlayDataUri = await buildOrthoOverlayDataUri(job.orthoPngUrl, trace);
  const html = buildReportHtml(job, measurements, trace, orthoOverlayDataUri);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  let pdfBuffer: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    pdfBuffer = await page.pdf({ format: "letter", printBackground: true });
  } finally {
    await browser.close();
  }

  const csv = buildLineItemsCsv(measurements);

  const reportPdfUrl = await s3PutBuffer(
    `${job.s3Prefix}/report/report.pdf`,
    Buffer.from(pdfBuffer),
    "application/pdf",
  );
  const lineItemsCsvUrl = await s3PutBuffer(`${job.s3Prefix}/report/line-items.csv`, csv, "text/csv");

  await prisma.job.update({
    where: { id: job.id },
    data: { reportPdfUrl, lineItemsCsvUrl, status: "DELIVERED" },
  });

  const { subject, html: emailHtml } = reportDeliveredEmail(job.id, job.address);
  await sendMail({ to: job.user.email, subject, html: emailHtml });
}
