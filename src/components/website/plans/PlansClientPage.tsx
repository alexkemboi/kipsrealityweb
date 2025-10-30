"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [loading, setLoading] = useState(true);

  // Fetch plans and features
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, featuresRes] = await Promise.all([
          fetch("/api/plan"),
          fetch("/api/feature?limit=6"),
        ]);

        if (!plansRes.ok || !featuresRes.ok)
          throw new Error("Failed to fetch data");

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

  const currentPrice = (plan: Plan) =>
    billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  const calculateSavings = (plan: Plan) =>
    plan.monthlyPrice * 12 - plan.yearlyPrice * 12;

  if (loading) return <p className="text-center mt-20">Loading plans...</p>;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-72 text-white bg-[#0b1f3a]">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f3a] to-[#12284a] opacity-90"></div>

        {/* Hero Content */}
        <div className="relative mx-auto max-w-6xl text-center z-10">
          <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Scale Your Property
            <span className="block bg-blue-400 bg-clip-text text-transparent">
              Business
            </span>
          </h1>
          <p className="text-lg lg:text-2xl leading-relaxed mb-16 max-w-5xl mx-auto text-gray-200">
            Join thousands of property managers who use RentFlow360 to save 10+
            hours weekly and grow their portfolios faster.
          </p>
        </div>

        {/* Decorative Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-full h-[120px]"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              d="M985.66 83.14C906.67 55.81 823.78 42.22 740 42.22c-82.94 0-165.9 13.54-247.83 40.91C382.6 113.13 300.67 122.9 218.8 111.12 146.26 100.9 72.6 77.46 0 58.22v62h1200V0c-69.02 27.11-138.16 56.41-214.34 83.14z"
              fill="#fff"
            ></path>
          </svg>
        </div>
      </section>

      {/* Plans Section */}
      <section className="relative px-6 pb-20 -mt-20 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative bg-white flex flex-col border ${
                  plan.badge === "Most Popular"
                    ? "border-blue-600 shadow-xl"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge
                      className={`${
                        plan.badge === "Most Popular"
                          ? "bg-blue-600"
                          : plan.badge === "Perfect for Startups"
                          ? "bg-emerald-600"
                          : "bg-amber-500"
                      } border-0 px-4 py-2 text-white font-semibold`}
                    >
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-6 pt-12 text-center">
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <div className="mb-2 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        ${currentPrice(plan)}
                      </span>
                      <span className="text-xl text-slate-500">/month</span>
                    </div>
                    {billingPeriod === "yearly" && (
                      <div className="text-sm text-green-600 font-semibold">
                        Save ${calculateSavings(plan)} annually
                      </div>
                    )}
                    <CardDescription className="text-slate-600 mt-2">
                      {plan.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-8">
                  <Button
                    className={`w-full text-lg py-3 font-semibold mb-8 ${
                      plan.badge === "Most Popular"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-900 text-white"
                    }`}
                    size="lg"
                  >
                    Start Free Trial
                  </Button>

                  <div className="space-y-4">
                    <p className="font-semibold text-slate-900 text-lg border-b pb-2">
                      What's included:
                    </p>
                    {plan.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-start gap-4 p-3 rounded-2xl bg-white/50 border border-slate-200 hover:bg-white/80 hover:border-slate-300 transition-all duration-300"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm mt-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-slate-700 text-sm font-medium">
                          {feature.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#0b1f3a] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Powerful Features
          </h2>
          <p className="text-lg lg:text-2xl leading-relaxed max-w-4xl mx-auto text-gray-300">
            Enhance your workflow with these incredible features included in
            RentFlow360.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-[#15386a] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center hover:border-blue-400 hover:shadow-blue-500/30 transition-all duration-500"
            >
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-4 h-0.5 w-12 bg-blue-300 transition-colors duration-300"></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
