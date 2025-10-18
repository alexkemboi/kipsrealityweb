import Image from "next/image";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";

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
      <section id="about" className="px-8 py-20 md:px-20 bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Intro */}
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold text-[#1E293B]">
              About <span className="text-[#FACC15]">Us</span>
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empowering Landlords. Supporting Tenants. Simplifying Property Management.
            </p>
            <p className="text-gray-700 max-w-4xl mx-auto">
              At <span className="font-semibold text-[#1E293B]">Kips Reality LLC</span>, we’re redefining the rental experience with a modern, tech-driven approach.
              Our platform was built to solve everyday challenges landlords and tenants face—and replace them with a single, seamless solution.
            </p>
          </div>

          {/* Our Story */}
          <div className="space-y-4">
            <h4 className="text-2xl font-bold text-[#1E293B]">Our Story</h4>
            <p className="text-gray-700">
              Kips Reality was born out of a simple idea: property management shouldn’t be complicated.
              Our founders, with deep roots in finance, compliance, and real estate, saw firsthand how landlords struggled with disconnected systems—and how tenants often felt left in the dark.
            </p>
            <p className="text-gray-700">
              We set out to build a smarter way. One platform. One experience. One solution.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-r from-[#FACC15]/10 to-[#1E293B]/10 p-8 rounded-xl shadow-md space-y-4">
            <h4 className="text-2xl font-bold text-[#1E293B]">Our Mission</h4>
            <p className="text-gray-700">
              To simplify property management by providing a seamless, technology-driven platform that connects landlords and tenants while ensuring transparency, efficiency, and trust.
            </p>
          </div>

          {/* What Makes Us Different */}
          <div>
            <h4 className="text-2xl font-bold text-[#1E293B] mb-6">What Makes Us Different</h4>
            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  title: "All-in-One Platform",
                  desc: "From property listings to lease signing, rent collection, and utility management—everything is integrated.",
                },
                {
                  title: "Smart Financial Tools",
                  desc: "With Stripe and Plaid integrations, we offer secure, fast, and reliable payment processing and financial verification.",
                },
                {
                  title: "Automation That Works",
                  desc: "Save time with automated bill splitting, invoice generation, and tenant screening.",
                },
                {
                  title: "Data-Driven Decisions",
                  desc: "Our analytics tools help property owners make informed choices and optimize performance.",
                },
                {
                  title: "Compliance & Security First",
                  desc: "We prioritize secure digital processes and tax compliance to protect both landlords and tenants.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition"
                >
                  <h5 className="font-semibold text-lg text-[#FACC15]">{item.title}</h5>
                  <p className="text-gray-600 mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Team */}
          <div>
            <h4 className="text-2xl font-bold text-[#1E293B] mb-6">Our Team</h4>
            <p className="text-gray-700 mb-6">
              We’re a passionate group of professionals with expertise in:
            </p>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {["Property Management", "Financial Technology", "Legal Compliance", "Customer Experience"].map((skill, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 p-6 rounded-lg text-center shadow hover:border-[#FACC15] transition"
                >
                  <h6 className="font-semibold text-[#1E293B]">{skill}</h6>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Promise */}
          <div className="bg-[#FACC15]/10 p-8 rounded-xl shadow space-y-4 text-center">
            <h4 className="text-2xl font-bold text-[#1E293B]">Our Brand Promise</h4>
            <p className="text-gray-700 text-lg font-medium">
              <span className="text-[#1E293B]">Professional.</span>{" "}
              <span className="text-[#FACC15]">Reliable.</span>{" "}
              <span className="text-[#1E293B]">Innovative.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-8 py-20 md:px-20 bg-white">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#1E293B]">
          Our Services
        </h3>
        <div className="grid gap-10 md:grid-cols-3">
          {[
            { title: "Find Properties", color: "text-[#FACC15]" },
            { title: "Manage Rentals", color: "text-[#1E293B]" },
            { title: "Trusted Support", color: "text-gray-700" },
          ].map((service, i) => (
            <div
              key={i}
              className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 hover:border-[#FACC15] transition"
            >
              <div className={`text-4xl mb-4 ${service.color}`}>🏠</div>
              <h4 className="text-xl font-semibold mb-2">{service.title}</h4>
              <p className="text-gray-600"></p>
            </div>
          ))}
        </div>
      </section>

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
      <footer className="bg-gray-100 text-gray-600 py-6 text-center border-t border-gray-200">
        <p>© {new Date().getFullYear()} KIPS REALITY. All rights reserved.</p>
      </footer>
    </main>
  );
}
