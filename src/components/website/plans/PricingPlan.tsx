"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Feature { id: number; title: string; description: string; }
interface Plan { id: number; name: string; badge?: string; monthlyPrice: number; yearlyPrice: number; description?: string; features: Feature[]; }

interface PricingProps {
  cta?: {
    title: string;
    subtitle: string;
    buttonText?: string;
    buttonUrl?: string;
  } | null;
}

export const PricingPlans = ({ cta }: PricingProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plan");
        if (!res.ok) {
          setPlans([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlans(data);
        } else {
          setPlans([]);
        }
      } catch (error) {
        setPlans([]);
      }
    };
    fetchPlans();
  }, []);

  const currentPrice = (plan: Plan) =>
    billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <section className="relative px-6 py-16 bg-slate-50">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-6 tracking-tight">
          {cta?.title || "Simple, Transparent Pricing"}
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
          {cta?.subtitle || "Choose the plan that fits your property management needs. No hidden fees."}
        </p>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col p-5 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${"bg-blue-700 text-white shadow-xl shadow-slate-900/10"
                } ${plan.badge ? "ring-4 ring-blue-500/20 scale-[1.02] z-10" : ""}`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 p-3">
                  <div className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold mb-1 text-white">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-base font-semibold text-blue-100">$</span>
                  <span className="text-4xl font-extrabold text-white">
                    {currentPrice(plan)}
                  </span>
                  <span className="text-xs font-medium text-blue-100/80">/mo</span>
                </div>
                <p className="text-sm leading-relaxed text-blue-50/80">
                  {plan.description}
                </p>
              </div>

              <div className="flex-grow space-y-2 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3 border-b border-white/20 pb-3 text-blue-200">
                  Includes
                </p>
                {plan.features.map((feature) => (
                  <div key={feature.id} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full p-0.5 bg-white/20">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[13px] font-medium leading-relaxed text-blue-50/90">
                      {feature.title}
                    </span>
                  </div>
                ))}
              </div>

              <Link href={`/signup?plan=${encodeURIComponent(plan.name)}`} className="w-full">
                <Button
                  className="w-full py-5 text-sm font-bold rounded-xl transition-all bg-white text-blue-900 hover:bg-blue-50 hover:shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-3 h-3" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section >
  );
};
