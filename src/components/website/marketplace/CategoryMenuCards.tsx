"use client";

import Link from "next/link";
import { Categories } from "@/app/data/CategoriesData";
import { Briefcase, Home, Tv, Wrench } from "lucide-react";

interface CategoryCardsProps {
  categories: Categories[];
}

export default function CategoryCards({ categories }: CategoryCardsProps) {
  // You can choose icons dynamically (optional)
  const icons = [Home, Tv, Wrench, Briefcase];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {categories.map((category, index) => {
        const Icon = icons[index % icons.length];
        return (
          <Link
            key={category.id}
            href={`/marketplace/agent/${category.name.toLowerCase()}/create`}
            className="group"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <Icon className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h2>
                <p className="text-gray-600 text-sm mt-2">
                  {category.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
