export default function Plans() {
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
    <section id="plans" className="px-8 py-20 md:px-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-4">
          Build Your Plan
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Choose from a variety of tailored solutions designed to simplify property management and enhance financial efficiency.
        </p>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-start shadow-sm hover:shadow-lg hover:border-[#FACC15] transition duration-300"
            >
              <div className={`text-5xl mb-4 ${plan.accent}`}>{plan.icon}</div>
              <h4 className="text-xl font-semibold text-[#1E293B] mb-2">{plan.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <button className="bg-[#FACC15] text-[#1E293B] font-semibold px-10 py-4 rounded-full shadow-md hover:bg-[#EAB308] hover:shadow-lg transition-all duration-300">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}
