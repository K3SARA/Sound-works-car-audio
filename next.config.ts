import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.32.73:3000", "192.168.32.73", "localhost:3000"],
};

export default nextConfig;
