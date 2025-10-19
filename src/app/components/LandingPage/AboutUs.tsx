export default function About(){
    return(
        <section id="about" className="px-8 py-20 md:px-20 bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Intro */}
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold text-[#1E293B]">
              About <span className="text-[#FACC15]">Us</span>
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empowering Landlords. Supporting Tenants. Simplifying Property Management.
            </p>
            <p className="text-gray-700 max-w-4xl mx-auto">
              At <span className="font-semibold text-[#1E293B]">Kips Reality LLC</span>, we’re redefining the rental experience with a modern, tech-driven approach.
              Our platform was built to solve everyday challenges landlords and tenants face—and replace them with a single, seamless solution.
            </p>
          </div>

          {/* Our Story */}
          <div className="space-y-4">
            <h4 className="text-2xl font-bold text-[#1E293B]">Our Story</h4>
            <p className="text-gray-700">
              Kips Reality was born out of a simple idea: property management shouldn’t be complicated.
              Our founders, with deep roots in finance, compliance, and real estate, saw firsthand how landlords struggled with disconnected systems—and how tenants often felt left in the dark.
            </p>
            <p className="text-gray-700">
              We set out to build a smarter way. One platform. One experience. One solution.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-r from-[#FACC15]/10 to-[#1E293B]/10 p-8 rounded-xl shadow-md space-y-4">
            <h4 className="text-2xl font-bold text-[#1E293B]">Our Mission</h4>
            <p className="text-gray-700">
              To simplify property management by providing a seamless, technology-driven platform that connects landlords and tenants while ensuring transparency, efficiency, and trust.
            </p>
          </div>
        </div>
      </section>
    )
}