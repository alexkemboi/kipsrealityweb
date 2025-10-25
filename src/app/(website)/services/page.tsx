"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import { HeroSection } from "@/components/website/services/HeroSection";
import { QuickStats } from "@/components/website/services/QuickStats";
import { CategorySection } from "@/components/website/services/CategorySection";
import { CTASection } from "@/components/website/services/CTASection";

interface Service {
  id: number;
  category_id: number;
  name: string;
  description: string;
  features: string[];
  impact: string;
  icon: string;
}

interface Category {
  id: number;
  name: string;
  tagline: string;
  color: string;
  services: Service[];
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();

        const formatted = data.map((cat: any) => ({
          ...cat,
          services:
            cat.services?.map((srv: any) => ({
              ...srv,
              features: Array.isArray(srv.features)
                ? srv.features
                : JSON.parse(srv.features || "[]"),
            })) || [],
        }));

        setCategories(formatted);
      } catch (err: any) {
        console.error("Error fetching services:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <QuickStats />

      {categories.length > 0 ? (
        categories.map((category, index) => (
          <CategorySection key={category.id} category={category} index={index} />
        ))
      ) : (
        <div className="text-center py-10 text-gray-500">
          No categories or services found.
        </div>
      )}

      <CTASection />
      <Footer />
    </div>
  );
}
