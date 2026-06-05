import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yafmpyemibuwjbvwwrae.supabase.co",
      },
    ],
  },
};

export default nextConfig;
