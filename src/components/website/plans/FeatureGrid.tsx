"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Zap, Shield, BarChart3, Users, Home } from "lucide-react";

interface Feature { id: number; title: string; description: string; }

export const FeatureGrid = () => {
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch("/api/feature?limit=6");
        const data = await res.json();
        setFeatures(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed features load", e);
        setFeatures([]);
      }
    };
    fetchFeatures();
  }, []);

  // Icon Mapping
  const getIcon = (index: number) => {
    const icons = [BarChart3, Home, Users, Shield, Zap, CheckCircle2];
    return icons[index % icons.length];
  };

  return (
    <section className="bg-white px-6 py-24 mx-auto border-t border-neutral-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3 block">
            Why RentFlow360?
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
            Powerful Features for Modern Landlords
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            Enhance your workflow with these incredible features included in RentFlow360.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = getIcon(idx);
            return (
              <div key={feature.id} className="flex flex-col items-start gap-5 p-6 rounded-2xl border border-neutral-100 bg-white hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={24} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
