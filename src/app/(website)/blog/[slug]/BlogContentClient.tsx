'use client';
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { BlogPost, blogPosts } from '@/app/data/blogData';

interface BlogContentClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}


export default function BlogContentClient({ post, relatedPosts }: BlogContentClientProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-3 text-neutral-700 hover:text-blue-500 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowLeft className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Back to Blog</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-background py-16">
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge className="bg-white/80 backdrop-blur-sm text-blue-600 border border-blue-200 font-medium px-3 py-1">
                {post.category}
              </Badge>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-8">
              {post.title}
            </h1>
            <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed mb-8 font-light max-w-3xl mx-auto">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-center gap-8 text-neutral-500 mb-12">
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-semibold text-neutral-900">{post.author}</div>
                  <div className="text-sm">{post.authorRole}</div>
                </div>
              </div>

              <div className="h-8 w-px bg-neutral-300" />

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="container mx-auto px-6 -mt-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-gray-100">
            <div className="aspect-[16/9] relative">
              <Image src={post.image} alt={post.title} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Content + Related Posts */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto space-y-16">
          <article className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section id="introduction" className="mb-16 scroll-mt-32">
              <p>{post.content.introduction}</p>
            </section>

            {/* Sections */}
            {post.content.sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-16 scroll-mt-32">
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-8">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            ))}

            {/* Conclusion */}
            <section id="conclusion" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-8">
                Conclusion
              </h2>
              <p>{post.content.conclusion}</p>
            </section>
          </article>

          {/* Related Posts */}
          <section>
            <h3 className="text-xl font-semibold mb-6">More Insights for You</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group block rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
                >
                  <Image src={r.image} alt={r.title} width={400} height={200} className="object-cover rounded-lg mb-2" />
                  <h4 className="font-semibold">{r.title}</h4>
                  <p className="text-sm text-gray-600">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
