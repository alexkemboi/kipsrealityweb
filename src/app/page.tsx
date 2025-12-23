import Navbar from "../components/website/Navbar";
import HeroSection from "../components/website/landing/HeroSection";
import About from "../components/website/landing/AboutUs";
import Footer from "../components/website/Footer";
import Contact from "../components/website/landing/ContactUs";
import { fetchAboutUs } from "@/lib/aboutUs";
import { fetchCompanyInfo } from "@/lib/company-info";
import { fetchCTAs } from "@/lib/cta";
import { PricingPlans } from "@/components/website/plans/PricingPlan";
import { FeatureGrid } from "@/components/website/plans/FeatureGrid";
import WhatMakes from "../components/website/landing/WhatMakes";
import Services from "../components/website/landing/ServicesSection";

export const dynamic = "force-dynamic";


export default async function Home() {
  const about = await fetchAboutUs();
  const companyInfo = await fetchCompanyInfo();
  const ctas = await fetchCTAs("home");


  const pricingCta = ctas.find(c => c.title.toLowerCase().includes("pricing"));
  const contactCta = ctas.find(c => c.title.toLowerCase().includes("touch") || c.title.toLowerCase().includes("contact"));


  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <HeroSection />
      {/* About Us Section */}
      <About aboutData={about} />

      {/* Features & Pricing */}
      <WhatMakes />
      <Services />
      <PricingPlans cta={pricingCta} />

      <Contact companyInfo={companyInfo} cta={contactCta} />
      <Footer />
    </main>
  );
}