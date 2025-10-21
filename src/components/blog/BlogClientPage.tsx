'use client'

import { BlogHeader } from './BlogHeader';
import { CategoryFilter } from './CategoryFilter';
import { BlogCard } from './BlogCard';
import { useState, useMemo } from 'react';
import { BlogPost } from '@/app/data/blogData';

interface BlogClientPageProps {
    initialPosts: BlogPost[];
}

export function BlogClientPage({ initialPosts }: BlogClientPageProps) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post) => {
            const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
            const matchesSearch =
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.category.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery, initialPosts]);

    return (
        <>
            <BlogHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />

            <main className="container mx-auto px-4 py-12">
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-muted-foreground">
                            No articles found. Try adjusting your search or filter.
                        </p>
                    </div>
                )}
            </main>
        </>
    );
}