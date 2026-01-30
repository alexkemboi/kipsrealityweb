import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
   * 1. Output Standalone 
   * Essential for VPS/Docker deployments. 
   * It creates a small 'standalone' folder with only necessary files for production.
   */
  output: "standalone",

  images: {
    // ❌ REMOVED: 'domains' (It is deprecated in Next.js 14+)

    // ✅ NEW: Strict Remote Patterns
    remotePatterns: [
      // External Image Providers
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
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/**"
      },

      // Your Production Domain (If you serve uploaded images from the server)
      // Replace with your actual domain or VPS IP if needed
      {
        protocol: "https",
        hostname: "rentflow360.com",
        pathname: "/**",
      },
      // Allow http for IP-based access (common in VPS setups before SSL)
      {
        protocol: "http",
        hostname: "184.168.21.114",
        pathname: "/**",
      },
    ],

    // Optimization: Compress images for faster page loads
    minimumCacheTTL: 60,
    formats: ["image/avif", "image/webp"],
  },

  // ⚠️ Safety: Ignored ESLint during build to prevent styling nitpicks from failing deployment
  

  // Optional: Uncomment this if Type Errors are blocking your build 
  // and you need to force a deploy (Not recommended long term, but good for MVP crunch)
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;