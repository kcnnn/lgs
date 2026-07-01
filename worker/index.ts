import "dotenv/config";
import { Worker } from "bullmq";
import { connection, type ProcessJobData, type GenerateReportJobData } from "../lib/queue";
import { processJob } from "./webodm-processor";
import { generateReport } from "./report-generator";

const processJobWorker = new Worker<ProcessJobData>(
  "process-job",
  async (job) => {
    await processJob(job.data.jobId);
  },
  { connection, concurrency: 2 },
);

const generateReportWorker = new Worker<GenerateReportJobData>(
  "generate-report",
  async (job) => {
    await generateReport(job.data.jobId);
  },
  { connection, concurrency: 2 },
);

for (const worker of [processJobWorker, generateReportWorker]) {
  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.name} ${job?.id} failed:`, err);
  });
  worker.on("completed", (job) => {
    console.log(`Job ${job.name} ${job.id} completed`);
  });
}

console.log("RooferClaw Scope worker started");
