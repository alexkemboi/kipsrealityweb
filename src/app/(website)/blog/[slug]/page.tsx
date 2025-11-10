import { notFound } from "next/navigation";
import BlogContentClient from "./BlogContentClient";
import { blogPosts } from "@/app/data/blogData";

interface BlogPostPageProps {
  params: { slug: string };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
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
