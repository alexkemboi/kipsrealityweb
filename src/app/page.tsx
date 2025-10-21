import Image from "next/image";
import Navbar from "../components/LandingPage/Navbar";
import HeroSection from "../components/LandingPage/HeroSection";
import About from "../components/LandingPage/AboutUs";
import Footer from "../components/LandingPage/Footer";
import WhatMakes from "../components/LandingPage/WhatMakes";
import OurTeam from "../components/LandingPage/OurTeam";
import BrandPromise from "../components/LandingPage/BrandPromise";
import Services from "../components/LandingPage/ServicesSection";
import Plans from "../components/LandingPage/Plans";
import Contact from "../components/LandingPage/ContactUs";
import {Testimonials} from "../components/Testimonial/TestimonialClient";
import { testimonials } from "./data/TestimonialData";


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
      <BrandPromise />
      <Services />
      <Plans />
      <Contact />
      <Footer />
    </main>
  );
}