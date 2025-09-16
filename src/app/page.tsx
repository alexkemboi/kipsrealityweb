import Image from "next/image";

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
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-8 py-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.jpg"
            alt="Kips Reality Logo"
            width={50}
            height={50}
            className="rounded"
          />
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-wide">
            KIPS REALITY
          </h1>
        </div>
        <nav className="hidden md:flex space-x-8 font-medium">
          <a href="#" className="hover:text-[#FACC15] transition">Home</a>
          <a href="#about" className="hover:text-[#FACC15] transition">About</a>
          <a href="#services" className="hover:text-[#FACC15] transition">Services</a>
          <a href="#plans" className="hover:text-[#FACC15] transition">Plans</a>
          <a href="#contact" className="hover:text-[#FACC15] transition">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between flex-1 px-8 py-20 md:px-20">
        <div className="max-w-xl space-y-6">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="text-[#FACC15]">Modern</span> Property <br />
            <span className="text-[#1E293B]">Management</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Sleek, professional, and easy-to-use solutions for finding, renting,
            and managing your dream properties.
          </p>
          <button className="bg-[#1E293B] text-white font-semibold rounded-md px-8 py-4 shadow-lg hover:bg-[#0f172a] transition transform hover:scale-105">
            Get Started
          </button>
        </div>

        {/* Hero Logo */}
        <div className="mt-12 md:mt-0 flex justify-center md:justify-end flex-1">
          <div className="w-72 h-72  bg-[#FACC15]/10 flex items-center justify-center shadow-xl p-6">
            <Image
              src="/logo.jpg"
              alt="Kips Reality Logo"
              width={200}
              height={200}
              className="object-contain"
            />
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
