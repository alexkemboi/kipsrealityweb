import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost","i.postimg.cc"],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "i.postimg.cc", pathname: "/**" },
    ],

    // Optional: configure allowed quality values (Next.js 16)
    minimumCacheTTL: 60,
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
