import Navbar from "../components/website/Navbar";
import HeroSection from "../components/website/landing/HeroSection";
import About from "../components/website/landing/AboutUs";
import Footer from "../components/website/Footer";
import FAQSection from "../components/website/landing/FAQSection";
import { fetchAboutUs } from "@/lib/aboutUs";
import { fetchCTAs } from "@/lib/cta";
import { PricingPlans } from "@/components/website/plans/PricingPlan";
import WhatMakes from "../components/website/landing/WhatMakes";
import Services from "../components/website/landing/ServicesSection";

export const dynamic = "force-dynamic";

export default async function Home() {
  const about = await fetchAboutUs();
  const ctas = await fetchCTAs("home");

  const pricingCta =
    ctas?.find((c: { title?: string }) =>
      c.title?.toLowerCase().includes("pricing")
    ) ?? null;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />

      {/* Hero */}
      <HeroSection />

      {/* About / Platform Overview */}
      <About aboutData={about} />

      {/* Why RentFlow360 / Differentiators */}
      <WhatMakes />

      {/* Services / Core Modules */}
      <Services />

      {/* Pricing */}
      <PricingPlans cta={pricingCta} />

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}