// app/page.tsx (Next.js 13+) or pages/index.tsx (Next.js 12)
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
      accent: "text-[#14B8A6]",
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
      accent: "text-[#14B8A6]",
    },
    {
      title: "Analytics & Reporting",
      description:
        "Gain insights into occupancy rates, financials, and performance with detailed reports.",
      icon: "📊",
      accent: "text-white",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0D1117] text-white flex flex-col">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center px-8 py-6 bg-[#0D1117] border-b border-gray-800">
        <h1 className="text-2xl font-bold text-[#FACC15] tracking-wide">KIPSREALITY</h1>
        <nav className="hidden md:flex space-x-8 font-medium">
          <a href="#" className="hover:text-[#14B8A6] transition">Home</a>
          <a href="#about" className="hover:text-[#14B8A6] transition">About</a>
          <a href="#services" className="hover:text-[#14B8A6] transition">Services</a>
          <a href="#plans" className="hover:text-[#14B8A6] transition">Plans</a>
          <a href="#contact" className="hover:text-[#14B8A6] transition">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between flex-1 px-8 py-20 md:px-20">
        <div className="max-w-xl space-y-6">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="text-[#FACC15]">Modern</span> Property <br />
            <span className="text-[#14B8A6]">Management</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Sleek, professional, and easy-to-use solutions for finding, renting,
            and managing your dream properties.
          </p>
          <button className="bg-[#14B8A6] text-[#0D1117] font-semibold rounded-md px-8 py-4 shadow-lg hover:bg-[#0EA5E9] transition transform hover:scale-105">
            Get Started
          </button>
        </div>

        {/* Hero Icon */}
        <div className="mt-12 md:mt-0 flex justify-center md:justify-end flex-1">
          <div className="w-72 h-72 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/40 flex items-center justify-center shadow-2xl">
            <span className="text-[#FACC15] text-8xl">🔑</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-8 py-20 md:px-20 bg-[#161B22]">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          Our Services
        </h3>
        <div className="grid gap-10 md:grid-cols-3">
          {[
            { title: "Find Properties", color: "text-[#FACC15]" },
            { title: "Manage Rentals", color: "text-[#14B8A6]" },
            { title: "Trusted Support", color: "text-white" },
          ].map((service, i) => (
            <div
              key={i}
              className="bg-[#0D1117] p-6 rounded-lg shadow-lg border border-gray-800 hover:border-[#14B8A6] transition"
            >
              <div className={`text-4xl mb-4 ${service.color}`}>🏠</div>
              <h4 className="text-xl font-semibold mb-2">{service.title}</h4>
              <p className="text-gray-400">

              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="px-8 py-20 md:px-20 bg-[#0D1117]">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
          Build Your Plan
        </h3>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="bg-[#161B22] border border-gray-800 rounded-xl p-6 flex flex-col shadow-lg hover:border-[#14B8A6] transition"
            >
              <div className={`text-4xl mb-4 ${plan.accent}`}>{plan.icon}</div>
              <h4 className="text-xl font-semibold mb-2">{plan.title}</h4>
              <p className="text-gray-400">{plan.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <button className="bg-[#14B8A6] text-[#0D1117] font-semibold px-8 py-4 rounded-md shadow-lg hover:bg-[#0EA5E9] transition w-full sm:w-auto">
            Get Started
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-8 py-20 md:px-20">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
          Contact Us
        </h3>
        <form className="max-w-2xl mx-auto space-y-6">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-4 rounded-md bg-[#161B22] border border-gray-700 text-white focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-4 rounded-md bg-[#161B22] border border-gray-700 text-white focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
          />
          <textarea
            placeholder="Your Message"
            rows={5}
            className="w-full p-4 rounded-md bg-[#161B22] border border-gray-700 text-white focus:ring-2 focus:ring-[#14B8A6] focus:outline-none"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-[#FACC15] text-[#0D1117] font-semibold py-3 rounded-md hover:bg-[#EAB308] transition"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-[#161B22] text-gray-400 py-6 text-center border-t border-gray-800">
        <p>© {new Date().getFullYear()} KIPSREALITY. All rights reserved.</p>
      </footer>
    </main>
  );
}
