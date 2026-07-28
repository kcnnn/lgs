import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/lgs",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
