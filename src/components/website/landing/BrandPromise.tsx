"use client";

import { ShieldCheck, Zap, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

export default function BrandPromise() {
  const promises = [
    {
      title: "Unyielding Professionalism",
      description: "We maintain the highest standards in every interaction and transaction.",
      icon: ShieldCheck,
    },
    {
      title: "Reliable Automation",
      description: "Our tech-driven workflows ensure nothing ever falls through the cracks.",
      icon: Zap,
    },
    {
      title: "Innovative Solutions",
      description: "Constantly evolving to meet the needs of the modern real estate market.",
      icon: HeartHandshake,
    },
  ];

  return (
    <section className="py-6 lg:py-8 bg-blue-50/20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-black text-blue-700 mb-6 tracking-tight font-heading">
              Our <span className="text-black">Brand Promise</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500/90 max-w-3xl mx-auto font-medium leading-relaxed opacity-95">
              At RentFlow360, we don't just provide software; we provide a partnership built on trust, innovation, and a relentless focus on your success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {promises.map((promise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center p-8 lg:p-10 bg-white rounded-[24px] border-2 border-blue-700 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center text-white mb-6 group-hover:bg-blue-800 transition-all duration-300 shadow-md shadow-blue-900/10">
                  <promise.icon size={28} strokeWidth={2.5} />
                </div>
                <h4 className="text-xl font-black text-blue-700 mb-3 tracking-tight uppercase font-heading">
                  {promise.title}
                </h4>
                <p className="text-base text-slate-600 leading-relaxed font-semibold">
                  {promise.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
