import type { Metadata } from "next";
import Navbar from "@/components/website/Navbar";
import { BlogClientPage } from "@/components/website/blog/BlogClientPage";
import { blogPosts } from "@/app/data/blogData";

// ✅ Static/local data => prefer cached rendering (better than force-dynamic)
// Revalidates every hour (safe future-proofing if data source changes later)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Latest Articles | Kips Reality",
  description:
    "Stay updated with the latest real estate insights, property trends, market analysis, and practical tips from Kips Reality.",
  keywords: [
    "real estate",
    "property",
    "market trends",
    "real estate blog",
    "housing market",
    "Kips Reality",
    "property investment",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Latest Articles | Kips Reality",
    description:
      "Explore real estate insights, market trends, and property advice from Kips Reality.",
    url: "/blog",
    siteName: "Kips Reality",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Latest Articles | Kips Reality",
    description:
      "Explore real estate insights, market trends, and property advice from Kips Reality.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <BlogClientPage initialPosts={blogPosts} />
    </main>
  );
}
