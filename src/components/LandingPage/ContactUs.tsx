export default function Contact() {

    return(
        <section id="contact" className="px-8 py-20 md:px-20 bg-white">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#1E293B]">
          Contact Us
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
            className="w-full bg-[#1E293B] text-white font-semibold py-3 rounded-md hover:bg-[#0f172a] transition"
          >
            Send Message
          </button>
        </form>
      </section>
    )

}
