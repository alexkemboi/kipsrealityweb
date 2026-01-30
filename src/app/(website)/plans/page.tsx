import { HeroSection } from "@/components/website/plans/HeroSection";
 import { PricingPlans } from "@/components/website/plans/PricingPlan";
 import { FeatureGrid } from "@/components/website/plans/FeatureGrid";
import Footer from "@/components/website/Footer";
import Navbar from "@/components/website/Navbar";

export const dynamic = "force-dynamic";

export default function PlansPage() {
  return (
    <>
      <Navbar/>
      <HeroSection page="Plans" />
      <PricingPlans /> 
      <FeatureGrid /> 
    </>
  );
}
