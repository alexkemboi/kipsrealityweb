import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '@/app/data/blogData';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface BlogPostParams {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: BlogPostParams) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Post Not Found - Kips Reality',
        };
    }

    return {
        title: `${post.title} - RentFlow360`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image],
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostParams) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    // Get related posts
    const relatedPosts = blogPosts.filter(p =>
        post.relatedPosts?.includes(p.id) ||
        (p.category === post.category && p.id !== post.id)
    ).slice(0, 3);

    return (
        <div className="min-h-screen bg-white">
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
                                    <span>{new Date(post.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
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
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-4 gap-16">
                        {/* Table of Contents */}
                        <aside className="lg:col-span-1">
                            <div className="sticky top-32">
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <h3 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        Contents
                                    </h3>
                                    <nav className="space-y-3">
                                        <a
                                            href="#introduction"
                                            className="flex items-center gap-3 text-sm text-neutral-600 hover:text-blue-500 transition-all duration-300 group py-2"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform">Introduction</span>
                                        </a>
                                        {post.content.sections.map((section) => (
                                            <a
                                                key={section.id}
                                                href={`#${section.id}`}
                                                className="flex items-center gap-3 text-sm text-neutral-600 hover:text-blue-500 transition-all duration-300 group py-2"
                                            >
                                                <span className="group-hover:translate-x-1 transition-transform">{section.title}</span>
                                            </a>
                                        ))}
                                        <a
                                            href="#conclusion"
                                            className="flex items-center gap-3 text-sm text-neutral-600 hover:text-blue-500 transition-all duration-300 group py-2"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform">Conclusion</span>
                                        </a>
                                    </nav>

                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <h4 className="font-semibold text-sm text-neutral-900 mb-3">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {post.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md border border-blue-200"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <article className="lg:col-span-3">
                            <div className="prose prose-lg max-w-none">

                                {/* Introduction */}
                                <section id="introduction" className="mb-16 scroll-mt-32">
                                    <div className="space-y-6 text-lg leading-relaxed text-neutral-700">
                                        <p className="text-2xl font-light text-neutral-900 leading-relaxed border-l-4 border-blue-500 pl-6 py-2 bg-blue-50/50 rounded-r-lg">
                                            {post.content.introduction}
                                        </p>

                                        {post.content.introduction.split('. ').slice(1).map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}

                                        {/* Quick Summary */}
                                        <div className="bg-blue-500/5 border border-blue-200 rounded-xl p-6 my-8">
                                            <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                Quick Summary
                                            </h4>
                                            <p className="text-neutral-700 text-sm leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {post.content.sections.map((section, index) => (
                                    <section key={section.id} id={section.id} className="mb-16 scroll-mt-32">
                                        <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
                                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                                            {section.title}
                                        </h2>

                                        <div className="space-y-8">
                                            {section.content.map((paragraph, pIndex) => (
                                                <p key={pIndex} className="text-lg leading-relaxed text-neutral-700">
                                                    {paragraph}
                                                </p>
                                            ))}

                                            {/* Highlights */}
                                            {section.highlights && (
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {section.highlights.map((highlight, hIndex) => (
                                                        <div key={hIndex} className="group p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-white text-sm font-bold">{hIndex + 1}</span>
                                                                </div>
                                                                <p className="text-neutral-700 leading-relaxed group-hover:text-neutral-900 transition-colors">
                                                                    {highlight}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Tips */}
                                            {section.tips && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                                                    <h4 className="font-semibold text-yellow-800 mb-3"> Pro Tips</h4>
                                                    <ul className="space-y-2">
                                                        {section.tips.map((tip, tIndex) => (
                                                            <li key={tIndex} className="text-yellow-700 text-sm">{tip}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                ))}

                                {/* Conclusion */}
                                <section id="conclusion" className="mb-16 scroll-mt-32">
                                    <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                                        Conclusion
                                    </h2>

                                    <div className="space-y-6">
                                        <p className="text-lg leading-relaxed text-neutral-700">
                                            {post.content.conclusion}
                                        </p>

                                        {/* Key Takeaways */}
                                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                                            <h4 className="font-semibold text-green-800 mb-4"> Key Takeaways</h4>
                                            <ul className="space-y-2">
                                                {post.content.keyTakeaways.map((takeaway, index) => (
                                                    <li key={index} className="text-green-700">{takeaway}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                {/* Author Bio */}
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-12">
                                    <div className="flex items-start gap-4">
                                        <div>
                                            <h4 className="font-bold text-neutral-900">{post.author}</h4>
                                            <p className="text-sm text-neutral-600 mb-2">{post.authorRole}</p>
                                            <p className="text-sm text-neutral-700">{post.authorBio}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>

            {/* CTA Section - Same as before */}

            {/* Related Articles - Dynamic */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <Badge className="bg-blue-50 text-blue-600 border-blue-200 mb-4">Continue Reading</Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                                More Insights for You
                            </h2>
                            <p className="text-neutral-600 text-lg">Explore related articles to deepen your knowledge</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <Link
                                    key={relatedPost.id}
                                    href={`/blog/${relatedPost.slug}`}
                                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                                >
                                    <div className="relative overflow-hidden aspect-[4/3]">
                                        <Image
                                            src={relatedPost.image}
                                            alt={relatedPost.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                    <div className="p-6">
                                        <Badge className="bg-blue-50 text-blue-600 border-blue-200 mb-3">
                                            {relatedPost.category}
                                        </Badge>
                                        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-blue-500 transition-colors">
                                            {relatedPost.title}
                                        </h3>
                                        <p className="text-neutral-600 text-sm line-clamp-2 leading-relaxed">
                                            {relatedPost.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}