"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeroData {
  title: string;
  subtitle: string;
  gradient?: string;
  searchBar?: boolean;
}

interface BlogHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const BlogHeader = ({ searchQuery, onSearchChange }: BlogHeaderProps) => {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHero() {
      try {
        const res = await fetch("/api/hero?page=blog");
        const data = await res.json();
        // ✅ Your API returns an array, so use the first item
        setHero(data[0]);
      } catch (error) {
        console.error("Error fetching blog hero:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHero();
  }, []);

  if (loading) {
    return (
      <header className="bg-neutral-900 text-white py-24 text-center">
        <p className="text-lg">Loading...</p>
      </header>
    );
  }

  if (!hero) {
    return (
      <header className="bg-neutral-900 text-white py-24 text-center">
        <p className="text-lg">No blog hero data available</p>
      </header>
    );
  }

  return (
    <header
      className="text-white pt-28 pb-20 relative"
      style={{
        background: hero.gradient || "linear-gradient(to right, #0f172a, #1f2937, #334155)",
      }}
    >
      <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {hero.title || "Latest Articles"}
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {hero.subtitle ||
              "Expert insights, guides, and tips to help you succeed in property management."}
          </p>

          {hero.searchBar && (
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
