import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";

export default function Contact() {

    return(
        <section id="contact" className="relative min-h-[80vh] flex  justify-center overflow-hidden px-8 py-20 md:px-20 ">
         <div className="absolute inset-0 z-0">
        <Image
          src={aboutBg}
          alt="Cityscape Background"
          className="w-full h-full object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
      </div>

                <div className="relative z-20 container">
          
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 text-black">
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
