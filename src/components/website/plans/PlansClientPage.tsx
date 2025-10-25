"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { Check } from "lucide-react";
import { Plans, Features } from "@/app/data/plansData";

export default function PlansClientPage() {
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");

    const currentPrice = (plan: typeof Plans[0]) => {
        return billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    };

    const calculateSavings = (plan: typeof Plans[0]) => {
        return plan.monthlyPrice * 12 - plan.yearlyPrice * 12;
    };

    return (
        <>

        
            <section className="relative overflow-hidden  pt-32 pb-72 text-black">
                <div className="absolute inset-0 z-0">
                        <Image
                          src={aboutBg}
                          alt="Cityscape Background"
                          className="w-full h-full object-cover opacity-15"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
                      </div>
                <div className="relative mx-auto max-w-6xl text-center">
                    <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                        Scale Your Property
                        <span className="block bg-blue-400 bg-clip-text text-transparent">
                            Business
                        </span>
                    </h1>
                    <p className="text-lg lg:text-2xl text-[#151b1f]/90 leading-relaxed mb-16 max-w-5xl mx-auto">
                        Join thousands of property managers who use RentFlow360 to save 10+ hours weekly and grow their portfolios faster.
                    </p>
                </div>
            </section>

            <section className="relative px-6 pb-20 -mt-44">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 md:grid-cols-3">
                        {Plans.map((plan) => {
                            return (
                                <Card
                                    key={plan.name}
                                    className={`relative bg-white flex flex-col border-1 ${plan.badge === "Most Popular"
                                        ? "border-purple-500 shadow-xl"
                                        : "border-slate-200 hover:border-slate-300"
                                        }`}
                                >
                                    {plan.badge && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className={`${plan.badge === "Most Popular"
                                                ? "bg-purple-500"
                                                : plan.badge === "Perfect for Startups"
                                                    ? "bg-blue-500"
                                                    : "bg-amber-500"
                                                } border-0 px-4 py-2 text-white font-semibold`}>
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
                                            className={`w-full text-lg py-3 font-semibold mb-8 ${plan.badge === "Most Popular"
                                                ? "bg-purple-500 text-white"
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
                                                    key={feature}
                                                    className="flex items-start gap-4 p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200/40 hover:bg-white/80 hover:border-slate-300/60 hover:shadow-sm transition-all duration-300 group"
                                                >
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm flex-shrink-0 mt-0.5">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                    <span className="text-slate-700 leading-relaxed text-sm font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section - Professional Simplicity */}
            <section className="bg-slate-50/50 px-6 py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-normal text-slate-900 md:text-5xl mb-6 tracking-tight">
                            Complete Property Management
                            <span className="block text-slate-700 font-light mt-2">Suite</span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Every tool meticulously designed to work together, eliminating complexity and saving you valuable time.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group bg-white rounded-xl p-6 border border-slate-100 hover:border-slate-300 transition-all duration-300"
                            >
                                <h3 className="text-lg font-semibold text-slate-800 mb-3 group-hover:text-slate-900">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Subtle hover effect */}
                                <div className="mt-4 h-0.5 w-12 bg-slate-100 group-hover:bg-blue-200 transition-colors duration-300"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden bg-neutral-900 px-6 py-20 text-white">
                <div className="relative mx-auto max-w-4xl text-center">
                    <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                        Ready to Transform Your
                        <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Property Business?
                        </span>
                    </h2>
                    <p className="mb-8 text-xl text-blue-100 max-w-2xl mx-auto">
                        Join thousands of successful property managers who have streamlined their operations and grown their portfolios with RentFlow360.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center items-center">
                        <div className="flex gap-4">
                            <Button
                                className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-lg font-semibold rounded-xl border-0"
                                size="lg"
                            >
                                Start Free Trial
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold rounded-xl"
                                size="lg"
                            >
                                Schedule Demo
                            </Button>
                        </div>
                    </div>

                    <p className="mt-6 text-blue-200 text-sm">
                        No credit card required • 14-day free trial • Setup in minutes
                    </p>
                </div>
            </section>
        </>
    );
}