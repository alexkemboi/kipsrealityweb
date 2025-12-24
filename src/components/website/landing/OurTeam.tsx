"use client";

import { Users, Briefcase, ShieldCheck, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

const expertises = [
  {
    title: "Property Management",
    icon: Users,
  },
  {
    title: "Financial Technology",
    icon: Briefcase,
  },
  {
    title: "Legal Compliance",
    icon: ShieldCheck,
  },
  {
    title: "Customer Experience",
    icon: HeartHandshake,
  },
];

export default function OurTeam() {
  return (
    <section id="our-team" className="py-8 lg:py-10 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-5xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-[#003b73] mb-6 tracking-tighter">
            Our <span className="text-black">Team</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-bold opacity-95">
            We're a passionate group of professionals with expertise across every corner of property management, finance, and technology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {expertises.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#003b73] rounded-[24px] p-10 flex flex-col items-center text-center shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
            >
              {/* Icon Box */}
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-[#003b73] mb-8 group-hover:scale-110 transition-transform duration-300">
                <item.icon size={28} />
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-white leading-tight">
                {item.title}
              </h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
