import { Queue, type ConnectionOptions } from "bullmq";

export function parseRedisUrl(redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"): ConnectionOptions {
  const url = new URL(redisUrl);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  };
}

export const connection = parseRedisUrl();

export type ProcessJobData = { jobId: string };
export type GenerateReportJobData = { jobId: string };

export const processJobQueue = new Queue<ProcessJobData>("process-job", { connection });
export const generateReportQueue = new Queue<GenerateReportJobData>("generate-report", {
  connection,
});
