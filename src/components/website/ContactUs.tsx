import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";

export default function Contact() {

    return(
        <section id="contact" className="relative min-h-[80vh] flex  justify-center overflow-hidden px-8 py-20 md:px-20 ">
           {/* Background Image & Overlays */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={aboutBg}
                    alt="City skyline background for About section"
                    fill
                    className="object-cover"
                    quality={90}
                    priority
                  />
                  <div className="absolute inset-0 bg-neutral-900/95" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-900/60" />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/40 via-transparent to-neutral-900/40" />
                  <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
                  </div>
          
                  {/* Floating Orbs */}
                  <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-float-slow" />
                  <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-medium delay-2000" />
                </div>
                <div className="relative z-20 container">
          
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
          Contact{""}
          <span className="text-gradient-primary animate-gradient"> Us</span>
        </h3>
        <form className="max-w-2xl mx-auto space-y-6">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
          />
          <textarea
            placeholder="Your Message"
            rows={5}
            className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-[#2b7dfb] text-white font-semibold py-3 rounded-md hover:bg-[#0f172a] transition"
          >
            Send Message
          </button>
        </form>
        </div>
      </section>
    )

}
