// Services Section
export default function Services() {
  const services = [
    {
      title: "Find Properties",
      desc: "Discover verified listings tailored to your budget and preferences in just a few clicks.",
      icon: "🏠",
      color: "text-[#FACC15]",
    },
    {
      title: "Manage Rentals",
      desc: "Easily handle lease agreements, rent payments, and maintenance requests — all in one platform.",
      icon: "📋",
      color: "text-[#1E293B]",
    },
    {
      title: "Trusted Support",
      desc: "Get 24/7 assistance from our dedicated support team to ensure seamless property management.",
      icon: "🤝",
      color: "text-gray-700",
    },
  ];

  return (
    <section id="services" className="px-8 py-20 md:px-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-4">
          Our Services
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          We provide a comprehensive suite of services designed to make property ownership and management effortless.
        </p>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          {services.map((service, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-8 text-left shadow-sm hover:shadow-lg hover:border-[#FACC15] transition-all duration-300"
            >
              <div className={`text-5xl mb-4 ${service.color}`}>{service.icon}</div>
              <h4 className="text-xl font-semibold text-[#1E293B] mb-2">{service.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
