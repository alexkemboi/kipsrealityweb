
export default function WhatMakes() {
    return(
<section id="about" className="px-8 py-20 md:px-20 bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
         

          {/* What Makes Us Different */}
          <div>
            <h4 className="text-2xl font-bold text-[#1E293B] mb-6">What Makes Us Different</h4>
            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  title: "All-in-One Platform",
                  desc: "From property listings to lease signing, rent collection, and utility management—everything is integrated.",
                },
                {
                  title: "Smart Financial Tools",
                  desc: "With Stripe and Plaid integrations, we offer secure, fast, and reliable payment processing and financial verification.",
                },
                {
                  title: "Automation That Works",
                  desc: "Save time with automated bill splitting, invoice generation, and tenant screening.",
                },
                {
                  title: "Data-Driven Decisions",
                  desc: "Our analytics tools help property owners make informed choices and optimize performance.",
                },
                {
                  title: "Compliance & Security First",
                  desc: "We prioritize secure digital processes and tax compliance to protect both landlords and tenants.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition"
                >
                  <h5 className="font-semibold text-lg text-[#FACC15]">{item.title}</h5>
                  <p className="text-gray-600 mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
          )
          }
