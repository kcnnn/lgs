import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import type { Readable } from "node:stream";

const globalForS3 = globalThis as unknown as { s3: S3Client | undefined };

export const s3 =
  globalForS3.s3 ??
  new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "",
    },
  });

if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3;

const BUCKET = process.env.S3_BUCKET ?? "";

export function s3PublicUrl(key: string) {
  const endpoint = (process.env.S3_ENDPOINT ?? "").replace(/\/$/, "");
  return `${endpoint}/${BUCKET}/${key}`;
}

export async function presignPutUrl(key: string, contentType: string, expiresInSeconds = 900) {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function presignGetUrl(key: string, expiresInSeconds = 900) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

export async function s3ListKeys(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken: continuationToken }),
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);
  return keys;
}

export async function s3GetObjectStream(key: string): Promise<Readable> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return res.Body as Readable;
}

export async function s3UploadStream(key: string, body: Readable, contentType: string) {
  const upload = new Upload({
    client: s3,
    params: { Bucket: BUCKET, Key: key, Body: body, ContentType: contentType },
  });
  await upload.done();
  return s3PublicUrl(key);
}

export async function s3PutBuffer(key: string, body: Buffer | string, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return s3PublicUrl(key);
}

export { BUCKET, PutObjectCommand, GetObjectCommand };
