import Navbar from "../components/website/Navbar";
import HeroSection from "../components/website/landing/HeroSection";
import About from "../components/website/landing/AboutUs";
import Footer from "../components/website/Footer";
import WhatMakes from "../components/website/landing/WhatMakes";
import OurTeam from "../components/website/landing/OurTeam";
import Services from "../components/website/landing/ServicesSection";
import Contact from "../components/website/landing/ContactUs";
import { Testimonials } from "../components/website/Testimonial/TestimonialClient";
import { TypewriterEffectDemo } from "@/components/website/landing/BrandWords";
import { fetchTestimonials } from "@/lib/testimonial"
import { fetchAboutUs } from "@/lib/aboutUs";
import Gradient from "@/components/website/landing/Gradient";
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