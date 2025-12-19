"use client";

import Image from "next/image";

const integrations = [
  {
    name: "QuickBooks",
    logo: "/quick.png",
  },
  {
    name: "Stripe",
    logo: "/stripe.png",
  },
  {
    name: "PayPal",
    logo: "/paypal-logo.png",
  },
  {
    name: "Google Workspace",
    logo: "/google-symbol.png",
  },

];

export default function Integrations() {
  return (
    <section className="relative py-12 bg-[#111d33] text-white overflow-hidden flex flex-col items-center justify-center">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-700/10 blur-3xl rounded-full animate-float-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/10 blur-3xl rounded-full animate-float-medium"></div>

      <div className="relative z-10 w-[90%] max-w-6xl text-center">
        {/* Heading */}
        <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4 text-slate-100">
          Seamlessly integrates with your favorite tools.
        </h2>

        {/* Description */}
        <p className="text-white/70 text-lg mb-12">
          Connect your RentFlow360 experience with trusted platforms you already use.
        </p>




        {/* Integration Cards */}
        <div className="mt-10 flex flex-wrap justify-center gap-8">
          {integrations.map((item) => (
            <div
              key={item.name}
              className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-6 w-64 flex flex-col items-center justify-center shadow-lg hover:shadow-blue-600/20 hover:scale-105 transition-all duration-300"
            >
              <div className="relative w-10 h-10 mb-4">
                <Image
                  src={item.logo}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-semibold text-white text-lg">{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
