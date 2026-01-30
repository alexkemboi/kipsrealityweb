import type { Metadata } from 'next';
import { BlogClientPage } from '@/components/website/blog/BlogClientPage';
import Navbar from '@/components/website/Navbar';
import { blogPosts } from "@/app/data/blogData"

export const metadata: Metadata = {
  title: 'Latest Articles - Kips Reality',
  description: 'Stay updated with the latest real estate insights and market trends',
  keywords: 'real estate, property, market news, articles',
}

export const dynamic = "force-dynamic";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <BlogClientPage initialPosts={blogPosts} />
    </div>
  );
}