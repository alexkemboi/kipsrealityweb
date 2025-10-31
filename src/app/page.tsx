import Image from "next/image";
import Navbar from "../components/website/Navbar";
import HeroSection from "../components/website/landing/HeroSection";
import About from "../components/website/landing/AboutUs";
import Footer from "../components/website/Footer";
import WhatMakes from "../components/website/landing/WhatMakes";
import OurTeam from "../components/website/landing/OurTeam";
import BrandPromise from "../components/website/landing/BrandPromise";
import Services from "../components/website/landing/ServicesSection";
import Plans from "../components/website/landing/Plans";
import Contact from "../components/website/landing/ContactUs";
import { Testimonials } from "../components/website/Testimonial/TestimonialClient";
import ServicePage from "@/app/(website)/services/page"
import { TypewriterEffectDemo } from "@/components/website/landing/BrandWords";
import { fetchTestimonials } from "@/lib/testimonial"
import { fetchAboutUs } from "@/lib/aboutUs";

import { CTASection } from "@/components/website/services/CTASection";
import { CategorySection } from "@/components/website/services/CategorySection";
import { QuickStats } from "@/components/website/services/QuickStats";
import { servicesData } from "./data/servicesData";
import PlansPage from "./(website)/plans/page";
export const dynamic = "force-dynamic";


export default async function Home() {
  const testimonials = await fetchTestimonials();
  const about = await fetchAboutUs();


  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <HeroSection  />
      {/* About Us Section */}
      <About aboutData={about} />
      <WhatMakes />
      <TypewriterEffectDemo />
      <Services />

      <OurTeam />

      <Testimonials initialTestimonials={testimonials} />



      <PlansPage />
      <Contact />
      <Footer />
    </main>
  );
}