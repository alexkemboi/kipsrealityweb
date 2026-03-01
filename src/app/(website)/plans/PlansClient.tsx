"use client";

import * as React from "react";
import { PricingPlans } from "@/components/website/plans/PricingPlan";
import { HeroSection } from "@/components/website/plans/HeroSection";
import { FeatureGrid } from "@/components/website/plans/FeatureGrid";

export default function PlansClient() {
    return (
        <div className="flex flex-col min-h-screen">
            <HeroSection page="plans" />
            <div className="flex-grow">
                <PricingPlans />
                <FeatureGrid />
            </div>
        </div>
    );
}
