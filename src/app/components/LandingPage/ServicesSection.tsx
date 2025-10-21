import Link from "next/link";


export default function Services() {
  const services = [
    {
      title: "Find Properties",
      icon: "🏠",
      color: "text-yellow-400",
      description:
        "Explore a wide range of properties to find your perfect home or investment.",
    },
    {
      title: "Manage Rentals",
      icon: "🗂️",
      color: "text-blue-500",
      description:
        "Easily manage your rental properties with our intuitive tools.",
    },
    {
      title: "Trusted Support",
      icon: "🤝",
      color: "text-green-500",
      description:
        "Get reliable support from our dedicated team whenever you need it.",
    },
  ];

  return (
    <section
      id="services"
      className="px-6 py-24 md:px-20 bg-gradient-to-b from-white to-gray-50"
    >
      <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
        Our Services
      </h3>
      <div className="grid gap-10 md:grid-cols-3">
        {services.map((service, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-transform duration-300"
          >
            <div
              className={`text-5xl mb-6 ${service.color} flex justify-center`}
            >
              {service.icon}
            </div>
            <h4 className="text-xl font-semibold text-center mb-3">
              {service.title}
            </h4>
            <p className="text-gray-600 text-center">{service.description}</p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/services"
                className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
