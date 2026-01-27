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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

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
    <section className="relative px-6 py-12 bg-slate-50">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#003b73] mb-4 tracking-tight">
          {cta?.title || "Simple, Transparent Pricing"}
        </h2>
        <p className="text-base text-slate-600 max-w-2xl mx-auto font-medium">
          {cta?.subtitle || "Choose the plan that fits your property management needs. No hidden fees."}
        </p>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${"bg-[#003b73] text-white shadow-lg shadow-slate-900/10"
                } ${plan.badge ? "ring-2 ring-[#003b73]/20 scale-[1.01] z-10" : ""}`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 p-2">
                  <div className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <h3 className="text-base font-bold mb-1 text-white">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-sm font-semibold text-white/90">$</span>
                  <span className="text-3xl font-extrabold text-white">
                    {currentPrice(plan)}
                  </span>
                  <span className="text-xs font-medium text-white/90">/ mo</span>
                </div>
                <p className="text-xs leading-relaxed text-white/80">
                  {plan.description}
                </p>
              </div>

              <div className="flex-grow space-y-1.5 mb-4">
                <p className="text-[9px] font-bold uppercase tracking-wider mb-2 border-b border-white/20 pb-2 text-white/90">
                  Includes
                </p>
                {plan.features.map((feature) => (
                  <div key={feature.id} className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full p-0.5 bg-white/20">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[11px] font-medium leading-relaxed text-white/80">
                      {feature.title}
                    </span>
                  </div>
                ))}
              </div>

              <Link href={`/signup?plan=${encodeURIComponent(plan.name)}`} className="w-full">
                <Button
                  className="w-full py-3 text-xs font-bold rounded-xl transition-all bg-white text-[#003b73] hover:bg-[#f0f7ff] hover:shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-1.5 w-3 h-3" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section >
  );
};
