import Image from "next/image";
import Navbar from "../components/website/Navbar";
import HeroSection from "../components/website/HeroSection";
import About from "../components/website/AboutUs";
import Footer from "../components/website/Footer";
import WhatMakes from "../components/website/WhatMakes";
import OurTeam from "../components/website/OurTeam";
import BrandPromise from "../components/website/BrandPromise";
import Services from "../components/website/ServicesSection";
import Plans from "../components/website/Plans";
import Contact from "../components/website/ContactUs";
import {Testimonials} from "../components/website/Testimonial/TestimonialClient";
import { testimonials } from "./data/TestimonialData";
import ServicesPage from "./services/page";
import PlansClientPage from "@/components/plans/PlansClientPage";
import { CTASection } from "@/components/services/CTASection";
import { CategorySection } from "@/components/services/CategorySection";
import { QuickStats } from "@/components/services/QuickStats";
import { servicesData } from "./data/servicesData";


export default function Home() {


  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <HeroSection />
      {/* About Us Section */}
      <About />
      <WhatMakes />
      <Testimonials initialTestimonials={testimonials} />
      <OurTeam />


      <ServicesPage />

      <PlansClientPage />
      <Contact />
      <Footer />
    </main>
  );
}