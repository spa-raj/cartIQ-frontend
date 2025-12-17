import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Fix workspace root warning by explicitly setting the output file tracing root
  outputFileTracingRoot: path.join(__dirname),

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
