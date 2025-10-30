"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { contactSchema, ContactData } from "@/app/data/ContactData";
import { useState } from "react";

export default function Contact() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactData) => {
    setServerMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const resData = await response.json();
        setErrorMessage(
          resData.error || "Something went wrong while sending your message."
        );
        return;
      }

      const resData = await response.json();
      setServerMessage(resData.message || "Message sent successfully!");
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("Network error. Please try again later.");
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-[80vh] flex justify-center overflow-hidden px-8 py-20 md:px-20"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* <Image
          src={aboutBg}
          alt="Cityscape Background"
          className="w-full h-full object-cover opacity-15"
          priority
        /> */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
      </div>

      {/* Form */}
      <div className="relative z-20 container">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-8 text-black">
          Contact{" "}
          <span className="text-gradient-primary animate-gradient">Us</span>
        </h3>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Name */}
          <div>
            <input
              type="text"
              placeholder="Your Name"
              {...register("name")}
              className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Your Email"
              {...register("email")}
              className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Country Code + Phone */}
          <div className="flex gap-2">
            <select
              {...register("countryCode")}
              className="w-1/4 p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
            >
              <option value="">Code</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+254">🇰🇪 +254</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+61">🇦🇺 +61</option>
            </select>

            <input
              type="tel"
              placeholder="Phone Number"
              {...register("phone")}
              className="flex-1 p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none"
            />
          </div>
          {(errors.countryCode || errors.phone) && (
            <p className="text-red-500 text-sm mt-1">
              {errors.countryCode?.message || errors.phone?.message}
            </p>
          )}

          {/* Message */}
          <div>
            <textarea
              placeholder="Your Message"
              rows={5}
              {...register("message")}
              className="w-full p-4 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#FACC15] focus:outline-none resize-none"
            ></textarea>
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2b7dfb] text-white font-semibold py-3 rounded-md hover:bg-[#0f172a] transition"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>

          {/* Feedback */}
          {serverMessage && (
            <p className="text-green-600 text-center mt-3">{serverMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-600 text-center mt-3">{errorMessage}</p>
          )}
        </form>
      </div>
    </section>
  );
}
