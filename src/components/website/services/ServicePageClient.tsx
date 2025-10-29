"use client";

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

interface Props {
  categories: Category[];
}

export default function ServicesPageClient({ categories }: Props) {
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
