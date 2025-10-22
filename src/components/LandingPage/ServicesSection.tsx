// Services Section
export default function Services() {
  const services = [
    {
      title: "Property Management",
      desc: "Centrally register, categorize, and manage properties, leases, maintenance, and documentation in one unified dashboard.",
      icon: "🏢",
      color: "text-[#FACC15]",
    },
    {
      title: "Invoicing & Rent Collection",
      desc: "Automate rent billing, payments, and reconciliation with integrated ledgers and multi-method payment support.",
      icon: "💳",
      color: "text-[#1E293B]",
    },
    {
      title: "Tenant Screening & Onboarding",
      desc: "Digitally process tenant applications, perform credit checks, and manage compliant onboarding workflows securely.",
      icon: "🧾",
      color: "text-[#3B82F6]",
    },
    {
      title: "Utility Management",
      desc: "Track, allocate, and invoice utilities accurately with options for API integration and tenant transparency.",
      icon: "💡",
      color: "text-[#F97316]",
    },
    {
      title: "Marketplace",
      desc: "Connect buyers, sellers, and renters in a verified real estate marketplace for properties and home essentials.",
      icon: "🛒",
      color: "text-[#10B981]",
    },
    {
      title: "Support & Communication",
      desc: "Access 24/7 assistance, ticketing, and in-app chat with a centralized help desk and self-service knowledge base.",
      icon: "🤝",
      color: "text-gray-700",
    },
    {
      title: "User Account & Access Management",
      desc: "Securely manage user accounts, permissions, and authentication with full audit trails and role-based access.",
      icon: "👥",
      color: "text-[#8B5CF6]",
    },
    {
      title: "Reporting & Analytics",
      desc: "Visualize KPIs and trends with customizable dashboards, data exports, and scheduled performance reports.",
      icon: "📊",
      color: "text-[#2563EB]",
    },
    {
      title: "Notifications & Alerts",
      desc: "Deliver real-time alerts and reminders via email, SMS, or in-app channels for payments, renewals, and updates.",
      icon: "🔔",
      color: "text-[#EAB308]",
    },
    {
      title: "Security & Compliance",
      desc: "Protect user data through encryption, monitoring, backups, and adherence to international data protection standards.",
      icon: "🔒",
      color: "text-[#DC2626]",
    },
    {
      title: "System Administration",
      desc: "Enable admins to manage platform settings, integrations, performance, and global configuration parameters.",
      icon: "⚙️",
      color: "text-[#64748B]",
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
