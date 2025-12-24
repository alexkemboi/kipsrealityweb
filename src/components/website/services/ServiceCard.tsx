"use client";
import { useState } from "react";
import { ArrowUpRight, Zap, CheckCircle2, Sparkles, HelpCircle } from "lucide-react";
import * as Icons from "lucide-react";
import { theme } from "@/app/data/servicesData";

interface ServiceCardProps {
  service: any;
  categoryColor: string;
}

export const ServiceCard = ({ service, categoryColor }: ServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);


  const IconName = service.icon;
  const Icon =
    IconName && (Icons as any)[IconName] && typeof (Icons as any)[IconName] === "function"
      ? (Icons as any)[IconName]
      : Icons.Sparkles;


  const activeColor = theme.secondary;

  return (
    <div className="h-full group">
      <div
        className="relative h-full rounded-2xl border bg-white transition-all shadow-sm hover:shadow-md overflow-hidden flex flex-col"
        style={{ borderColor: theme.border }}
      >
        {/* Top Accent Line (Optional but nice for "strong hierarchy") */}
        <div className="w-full h-1.5" style={{ backgroundColor: activeColor }} />

        <div className="p-6 flex-1 flex flex-col">
          {/* Icon */}
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ background: `${activeColor}15` }} // 15 = ~10% opacity
            >
              <Icon
                size={24}
                style={{ color: activeColor }}
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-4 flex-1">
            <h3
              className="text-lg font-bold mb-2 leading-tight"
              style={{ color: theme.primary }}
            >
              {service.name}
            </h3>

            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.text }}
            >
              {service.description}
            </p>
          </div>

          {/* Features List */}
          {service.features && service.features.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
              {service.features.slice(0, 3).map((feature: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5"
                >
                  <CheckCircle2
                    size={16}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: activeColor }}
                    strokeWidth={2}
                  />
                  <span
                    className="text-xs font-medium text-slate-500"
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
