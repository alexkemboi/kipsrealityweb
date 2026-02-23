'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Link2,
  Share2,
  ChevronRight,
} from "lucide-react";
import type { BlogPost } from "@/app/data/blogData";

interface BlogContentClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

type TocItem = {
  id: string;
  label: string;
};

const formatDateUTC = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

export default function BlogContentClient({
  post,
  relatedPosts,
}: BlogContentClientProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [copied, setCopied] = useState(false);

  const tocItems = useMemo<TocItem[]>(
    () => [
      { id: "introduction", label: "Introduction" },
      ...post.content.sections.map((section) => ({
        id: section.id,
        label: section.title,
      })),
      { id: "conclusion", label: "Conclusion" },
    ],
    [post.content.sections]
  );

  useEffect(() => {
    let ticking = false;

    const updateProgressAndActiveSection = () => {
      const article = document.getElementById("blog-article");
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset;
      const articleTop = scrollTop + rect.top;
      const articleHeight = article.offsetHeight;
      const viewportHeight = window.innerHeight;

      const maxScrollable = Math.max(articleHeight - viewportHeight, 1);
      const progressed = scrollTop - articleTop;
      const percentage = Math.min(
        100,
        Math.max(0, (progressed / maxScrollable) * 100)
      );
      setReadingProgress(percentage);

      // Active section tracking
      let current = tocItems[0]?.id ?? "introduction";
      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const elTop = el.getBoundingClientRect().top;
        if (elTop <= 140) current = item.id;
      }
      setActiveSection(current);

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgressAndActiveSection);
        ticking = true;
      }
    };

    updateProgressAndActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [tocItems]);

  const articleUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${post.slug}`
      : `/blog/${post.slug}`;

  const handleCopyLink = async () => {
    try {
      if (typeof window === "undefined") return;
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // no-op fallback
    }
  };

  const handleNativeShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: articleUrl,
        });
      } else {
        await handleCopyLink();
      }
    } catch {
      // user canceled / unsupported
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/blog"
              aria-label="Back to blog"
              className="group inline-flex items-center gap-3 text-neutral-700 hover:text-blue-500 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowLeft className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Back to Blog</span>
            </Link>

            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors"
              aria-label="Share article"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="h-1 w-full bg-transparent">
          <div
            className="h-full bg-blue-500 transition-[width] duration-150"
            style={{ width: `${readingProgress}%` }}
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-background py-16">
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge className="bg-white/80 backdrop-blur-sm text-blue-600 border border-blue-200 font-medium px-3 py-1">
                {post.category}
              </Badge>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-8 text-balance">
              {post.title}
            </h1>

            <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed mb-8 font-light max-w-3xl mx-auto text-pretty">
              {post.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-neutral-500 mb-12">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div>
                  <div className="font-semibold text-neutral-900">{post.author}</div>
                  <div className="text-sm">{post.authorRole}</div>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-neutral-300" />

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateUTC(post.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <div className="container mx-auto px-6 -mt-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-gray-100">
            <div className="aspect-[16/9] relative">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Content + TOC */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-12">
            {/* Article */}
            <article
              id="blog-article"
              className="prose prose-lg prose-neutral max-w-none lg:pr-2"
              aria-labelledby="blog-title"
            >
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
              <section id="conclusion" className="mb-8 scroll-mt-32">
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-8">
                  Conclusion
                </h2>
                <p>{post.content.conclusion}</p>
              </section>
            </article>

            {/* Sticky Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                {/* TOC */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-4">
                    On this page
                  </h3>
                  <nav aria-label="Table of contents">
                    <ul className="space-y-1">
                      {tocItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                          <li key={item.id}>
                            <a
                              href={`#${item.id}`}
                              className={`group flex items-start gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                                isActive
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-neutral-600 hover:bg-gray-50 hover:text-neutral-900"
                              }`}
                            >
                              <ChevronRight
                                className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                                  isActive ? "text-blue-600" : "text-neutral-400"
                                }`}
                              />
                              <span className="line-clamp-2">{item.label}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>

                {/* Share Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                    Share this article
                  </h3>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-gray-50 transition-colors"
                    >
                      <Link2 className="w-4 h-4" />
                      {copied ? "Link copied" : "Copy link"}
                    </button>
                  </div>
                </div>

                {/* Meta Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                    Category
                  </div>
                  <div className="font-medium text-neutral-900 mb-4">{post.category}</div>

                  <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                    Published
                  </div>
                  <div className="font-medium text-neutral-900 mb-4">{formatDateUTC(post.date)}</div>

                  <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                    Reading time
                  </div>
                  <div className="font-medium text-neutral-900">{post.readTime} min</div>
                </div>
              </div>
            </aside>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-20">
              <div className="flex items-center justify-between mb-6 gap-4">
                <h3 className="text-xl font-semibold text-neutral-900">
                  More Insights for You
                </h3>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View all posts
                </Link>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {relatedPosts.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group block rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    aria-label={`Read related post: ${r.title}`}
                  >
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 border border-gray-100">
                      <Image
                        src={r.image}
                        alt={r.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {r.category}
                      </Badge>
                      <span className="text-xs text-neutral-500">•</span>
                      <span className="text-xs text-neutral-500">{r.readTime} min read</span>
                    </div>

                    <h4 className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {r.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {r.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
