import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { Users, Briefcase, ShieldCheck, HeartHandshake } from "lucide-react";

export default function OurTeam() {
  return (
    <section
      id="our-team"
      className="relative min-h-[50vh] flex items-center justify-center overflow-hidden"
    >
     {/* --- Background --- */}
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
           </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        </div>

        

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Title */}
          <div className="space-y-4">
            <h3 className="text-4xl md:text-5xl font-bold text-black">
              Our{" "}
              <span className="text-gradient-primary animate-gradient">
                Team
              </span>
            </h3>
            <p className="text-lg lg:text-2xl text-[#151b1f]/90 leading-relaxed mb-16 max-w-5xl mx-auto">
              We’re a passionate group of professionals with expertise across
              every corner of property management, finance, and technology.
            </p>
          </div>

          {/* Expertise Grid */}
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mt-10">
            {[
              {
                title: "Property Management",
                icon: Users,
                color: "from-blue-500/40 to-cyan-400/40",
              },
              {
                title: "Financial Technology",
                icon: Briefcase,
                color: "from-emerald-500/40 to-teal-400/40",
              },
              {
                title: "Legal Compliance",
                icon: ShieldCheck,
                color: "from-indigo-500/40 to-purple-400/40",
              },
              {
                title: "Customer Experience",
                icon: HeartHandshake,
                color: "from-pink-500/40 to-rose-400/40",
              },
            ].map((member, i) => (
              <div
                key={i}
                className="group bg-[#1d3d67] border-white/20 rounded-2xl p-8 backdrop-blur-lg shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              >
                <div
                  className={`flex items-center justify-center w-14 h-14 mx-auto mb-5 rounded-xl bg-gradient-to-r ${member.color} group-hover:opacity-90 transition-all`}
                >
                  <member.icon className="w-7 h-7 text-white" />
                </div>
                <h6 className="font-semibold text-white text-lg">
                  {member.title}
                </h6>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
