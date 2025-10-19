// Services Section
export default function Services() {
  return (
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
  );
}