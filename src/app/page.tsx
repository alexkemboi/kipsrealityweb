import Image from "next/image";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import About from "./components/AboutUs";
import Footer from "./components/Footer";
import WhatMakes from "./components/WhatMakes";
import OurTeam from "./components/OurTeam";
import BrandPromise from "./components/BrandPromise";
import Services from "./components/ServicesSection";

export default function Home() {
  const plans = [
    {
      title: "Property Management",
      description:
        "Streamline property listings, maintenance requests, and lease tracking with ease.",
      icon: "🏢",
      accent: "text-[#FACC15]",
    },
    {
      title: "Tenant Screening",
      description:
        "Verify tenant backgrounds, credit scores, and rental history to ensure secure leasing.",
      icon: "🕵️‍♂️",
      accent: "text-[#1E293B]",
    },
    {
      title: "Rent Collection",
      description:
        "Automated rent reminders and secure online payment options for reliable cash flow.",
      icon: "💳",
      accent: "text-[#FACC15]",
    },
    {
      title: "Utility Payments",
      description:
        "Simplify tenant utility billing and tracking with integrated payment solutions.",
      icon: "⚡",
      accent: "text-[#1E293B]",
    },
    {
      title: "Analytics & Reporting",
      description:
        "Gain insights into occupancy rates, financials, and performance with detailed reports.",
      icon: "📊",
      accent: "text-[#1E293B]",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <HeroSection />
      {/* About Us Section */}
      <About />
      <WhatMakes />
      <OurTeam />
      <BrandPromise />
      <Services />

     

     

      {/* Plans Section */}
      <section id="plans" className="px-8 py-20 md:px-20 bg-gray-50">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#1E293B]">
          Build Your Plan
        </h3>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col shadow-md hover:border-[#FACC15] transition"
            >
              <div className={`text-4xl mb-4 ${plan.accent}`}>{plan.icon}</div>
              <h4 className="text-xl font-semibold mb-2">{plan.title}</h4>
              <p className="text-gray-600">{plan.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <button className="bg-[#FACC15] text-[#1E293B] font-semibold px-8 py-4 rounded-md shadow-lg hover:bg-[#EAB308] transition w-full sm:w-auto">
            Get Started
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-8 py-20 md:px-20 bg-white">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#1E293B]">
          Contact Us
        </h3>
        <form className="max-w-2xl mx-auto space-y-6">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
          />
          <textarea
            placeholder="Your Message"
            rows={5}
            className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-[#1E293B] text-white font-semibold py-3 rounded-md hover:bg-[#0f172a] transition"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
