"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { Check } from "lucide-react";
import Footer from "@/components/website/Footer";

interface Feature {
  id: number;
  title: string;
  description: string;
}

interface Plan {
  id: number;
  name: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description?: string;
  features: Feature[];
}

export default function PlansClientPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(true);

  // Fetch plans and 6 random features
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, featuresRes] = await Promise.all([
          fetch("/api/plan"),
          fetch("/api/feature?limit=6")
        ]);

        if (!plansRes.ok || !featuresRes.ok) throw new Error("Failed to fetch data");

        const plansData: Plan[] = await plansRes.json();
        const featuresData: Feature[] = await featuresRes.json();

        setPlans(plansData);
        setFeatures(featuresData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentPrice = (plan: Plan) => (billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice);

  const calculateSavings = (plan: Plan) => plan.monthlyPrice * 12 - plan.yearlyPrice * 12;

  if (loading) return <p className="text-center mt-20">Loading plans...</p>;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-72 text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src={aboutBg}
            alt="Cityscape Background"
            className="w-full h-full object-cover brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        </div>
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Scale Your Property
            <span className="block bg-blue-400 bg-clip-text text-transparent">Business</span>
          </h1>
          <p className="text-lg lg:text-2xl leading-relaxed mb-16 max-w-5xl mx-auto">
            Join thousands of property managers who use RentFlow360 to save 10+ hours weekly and grow their portfolios faster.
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="relative px-6 pb-20 -mt-44">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative bg-white flex flex-col border-1 ${
                  plan.badge === "Most Popular" ? "border-purple-500 shadow-xl" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge
                      className={`${
                        plan.badge === "Most Popular"
                          ? "bg-purple-500"
                          : plan.badge === "Perfect for Startups"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      } border-0 px-4 py-2 text-white font-semibold`}
                    >
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-6 pt-12 text-center">
                  <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="mb-2 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-slate-900">${currentPrice(plan)}</span>
                      <span className="text-xl text-slate-500">/month</span>
                    </div>
                    {billingPeriod === "yearly" && (
                      <div className="text-sm text-green-600 font-semibold">
                        Save ${calculateSavings(plan)} annually
                      </div>
                    )}
                    <CardDescription className="text-slate-600 mt-2">{plan.description}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-8">
                  <Button
                    className={`w-full text-lg py-3 font-semibold mb-8 ${
                      plan.badge === "Most Popular" ? "bg-purple-500 text-white" : "bg-slate-900 text-white"
                    }`}
                    size="lg"
                  >
                    Start Free Trial
                  </Button>

                  <div className="space-y-4">
                    <p className="font-semibold text-slate-900 text-lg border-b pb-2">What's included:</p>
                    {plan.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-start gap-4 p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200/40 hover:bg-white/80 hover:border-slate-300/60 hover:shadow-sm transition-all duration-300 group"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-slate-700 leading-relaxed text-sm font-medium">{feature.title}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section (6 Random Features) */}
      <section className="bg-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Powerful Features
          </h2>
          <p className="text-lg lg:text-2xl leading-relaxed max-w-4xl mx-auto">
            Enhance your workflow with these incredible features included in RentFlow360.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-[#1d3d67] backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center hover:border-white/30 hover:shadow-blue-500/30 transition-all duration-500 group cursor-pointer"
            >
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white text-lg leading-relaxed">{feature.description}</p>
              <div className="mt-4 h-0.5 w-12 bg-slate-100 group-hover:bg-blue-200 transition-colors duration-300"></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
