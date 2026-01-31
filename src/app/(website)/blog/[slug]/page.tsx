import { notFound } from "next/navigation";
import BlogContentClient from "./BlogContentClient";
import { blogPosts } from "@/app/data/blogData";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // related posts (server-side)
  const relatedPosts = blogPosts
    .filter(
      (p) =>
        post.relatedPosts?.includes(p.id) ||
        (p.category === post.category && p.id !== post.id)
    )
    .slice(0, 3);

  return <BlogContentClient post={post} relatedPosts={relatedPosts} />;
}
