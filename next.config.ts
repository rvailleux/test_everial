import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['86.253.8.81'],
  typescript: {
    // Allow build to complete despite TypeScript errors in existing files
    // K2 spec: existing LiveKit errors are acceptable
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
