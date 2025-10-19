export default function OurTeam() {
    return(
<section id="about" className="px-8 py-20 md:px-20 bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
         


          {/* Our Team */}
          <div>
            <h4 className="text-2xl font-bold text-[#1E293B] mb-6">Our Team</h4>
            <p className="text-gray-700 mb-6">
              We’re a passionate group of professionals with expertise in:
            </p>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {["Property Management", "Financial Technology", "Legal Compliance", "Customer Experience"].map((skill, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 p-6 rounded-lg text-center shadow hover:border-[#FACC15] transition"
                >
                  <h6 className="font-semibold text-[#1E293B]">{skill}</h6>
                </div>
              ))}
            </div>
          </div>
</div>
      </section>

     )
}