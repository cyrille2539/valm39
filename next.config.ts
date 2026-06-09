import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wriwpdmsayhvjjhuotqv.supabase.co",
      },
    ],
  },
};

export default nextConfig;
