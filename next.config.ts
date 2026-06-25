import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/(.*)",
        destination: "https://www.upskilleveryday.com/tools/disc",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
