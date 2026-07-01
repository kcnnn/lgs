import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | undefined;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
  }
  return transporter;
}

export async function sendMail(opts: { to: string | string[]; subject: string; html: string; text?: string }) {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

export function jobReadyToTraceEmail(jobId: string, address: string) {
  const url = `${process.env.PUBLIC_SITE_URL}/admin/jobs/${jobId}/trace`;
  return {
    subject: `Job ${jobId} ready to trace — ${address}`,
    html: `<p>The orthomosaic and DSM for <strong>${escapeHtml(address)}</strong> are ready.</p>
<p><a href="${url}">Open the tracing tool</a></p>`,
  };
}

export function jobFailedEmail(jobId: string, address: string, reason: string) {
  return {
    subject: `Job ${jobId} FAILED — ${address}`,
    html: `<p>Processing failed for <strong>${escapeHtml(address)}</strong>.</p>
<p>Reason: ${escapeHtml(reason)}</p>`,
  };
}

export function reportDeliveredEmail(jobId: string, address: string) {
  const url = `${process.env.PUBLIC_SITE_URL}/jobs/${jobId}`;
  return {
    subject: `Your roof measurement report is ready — ${address}`,
    html: `<p>Your report for <strong>${escapeHtml(address)}</strong> is ready.</p>
<p><a href="${url}">View and download your report</a></p>`,
  };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
