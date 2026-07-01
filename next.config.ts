import type { NextConfig } from "next";

const s3Hostname = process.env.S3_ENDPOINT
  ? new URL(process.env.S3_ENDPOINT).hostname
  : undefined;

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Ortho/report images live in the S3-compatible bucket referenced by S3_ENDPOINT.
      ...(s3Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: s3Hostname,
            },
            {
              protocol: "https" as const,
              hostname: `*.${s3Hostname}`,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
