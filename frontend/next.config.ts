import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/adctor",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

