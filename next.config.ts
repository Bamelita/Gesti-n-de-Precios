import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  reactStrictMode: true,
  // Fix for the root directory warning
  experimental: {
  }
};

export default nextConfig;
