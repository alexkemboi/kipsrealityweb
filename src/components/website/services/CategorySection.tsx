"use client";

import * as Icons from "lucide-react";
import { ServiceCard } from "./ServiceCard";
import { theme } from "@/app/data/servicesData";

interface CategorySectionProps {
  category: any;
  index: number;
}

export const CategorySection = ({ category, index }: CategorySectionProps) => {
  // Safe lookup + fallback
  const IconName = category.icon;

  const Icon =
    IconName && (Icons as any)[IconName] && typeof (Icons as any)[IconName] === "function"
      ? (Icons as any)[IconName]
      : Icons.Layers;

  const isEven = index % 2 === 0;

  return (
    <div
      className="relative py-20 lg:py-24"
      style={{
        background: isEven ? theme.white : theme.background,
        borderTop: `1px solid ${theme.border}`,
        borderBottom: `1px solid ${theme.border}`
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Category Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: theme.secondary }}
          >
            <Icon
              size={32}
              style={{ color: theme.white }}
              strokeWidth={1.5}
            />
          </div>

          <div className="flex-1">
            <h2
              className="text-3xl md:text-4xl font-bold mb-2 tracking-tight"
              style={{ color: theme.primary }}
            >
              {category.name}
            </h2>
            <p
              className="text-lg md:text-xl font-medium"
              style={{ color: theme.text }}
            >
              {category.tagline}
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {category.services?.map((service: any, idx: number) => (
            <ServiceCard
              key={idx}
              service={service}
              categoryColor={theme.secondary} // Enforce green consistency
            />
          ))}
        </div>
      </div>
    </div>
  );
};
