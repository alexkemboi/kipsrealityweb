import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/features-section";
import About from "./components/AboutUs";
import Footer from "./components/Footer";
import WhatMakes from "./components/WhatMakes";
import OurTeam from "./components/OurTeam";
import BrandPromise from "./components/BrandPromise";
import Services from "./components/ServicesSection";
import Plans from "./components/Plans";
import Contact from "./components/ContactUs";

export default function Home() {


  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <HeroSection />
      {/* About Us Section */}
      <FeaturesSection />
      <About />
      <WhatMakes />
      <OurTeam />
      <BrandPromise />
      <Services />
      <Plans />
      <Contact />
      <Footer />
    </main>
  );
}
