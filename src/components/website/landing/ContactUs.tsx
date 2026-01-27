"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import aboutBg from "@/assets/hero-cityscape.jpg";
import { contactSchema, ContactData } from "@/app/data/ContactData";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

interface ContactProps {
  companyInfo?: {
    contactEmail?: string | null;
    contactPhone?: string | null;
    contactEmailLabel?: string | null;
    contactPhoneLabel?: string | null;
    mailingAddress?: string | null;
    companyName?: string | null;
    website?: string | null;
  } | null;
  cta?: {
    title: string;
    subtitle: string;
  } | null;
}

export default function Contact({ companyInfo, cta }: ContactProps) {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactData) => {

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const resData = await response.json();
        toast.error(
          resData.error || "Something went wrong while sending your message."
        );
        return;
      }

      const resData = await response.json();
      toast.success(resData.message || "Message sent successfully!");
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Network error. Please try again later.");
    }
  };

  return (
    <section
      id="contact"
      className="relative flex justify-center overflow-hidden py-16 bg-white border-t border-neutral-100"
    >
      <div className="relative z-20 site-container">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Contact Information */}
          <div className="space-y-10 text-left">
            <div>
              <h3 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
                {cta?.title || (
                  <>Get in <span className="text-[#003b73]">Touch</span></>
                )}
              </h3>
              <p className="text-lg text-neutral-500 leading-relaxed max-w-md">
                Have questions about our plans or need a custom solution?
                Our team is ready to help you streamline your property management.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-5 text-neutral-700">
                <div className="w-12 h-12 rounded-2xl bg-[#003b73] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#003b73]/10 transition-transform hover:scale-105">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="font-bold text-lg mb-1 text-[#003b73]">{companyInfo?.contactEmailLabel || "Email Us"}</p>
                  <p className="text-neutral-500">{companyInfo?.contactEmail || "info@rentflow360.com"}</p>
                </div>
              </div>

              <div className="flex items-start gap-5 text-neutral-700">
                <div className="w-12 h-12 rounded-2xl bg-[#003b73] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#003b73]/10 transition-transform hover:scale-105">
                  <Phone size={22} />
                </div>
                <div>
                  <p className="font-bold text-lg mb-1 text-[#003b73]">{companyInfo?.contactPhoneLabel || "Call Us"}</p>
                  <p className="text-neutral-500">{companyInfo?.contactPhone || "+1 (425) 633-5001"}</p>
                </div>
              </div>


            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
            <h4 className="text-2xl font-bold mb-6 text-[#003b73]">
              Send us a Message
            </h4>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className="w-full p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-[#003b73]/20 focus:border-[#003b73] focus:outline-none transition-all"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  className="w-full p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-[#003b73]/20 focus:border-[#003b73] focus:outline-none transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Phone Number</label>
                <div className="flex gap-3">
                  <select
                    {...register("countryCode")}
                    className="w-[110px] p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 focus:ring-2 focus:ring-[#003b73]/20 focus:border-[#003b73] focus:outline-none"
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
                    placeholder="123 456 7890"
                    {...register("phone")}
                    className="flex-1 p-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-[#003b73]/10 focus:border-[#003b73] focus:outline-none transition-all"
                  />
                </div>
                {(errors.countryCode || errors.phone) && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">
                    {errors.countryCode?.message || errors.phone?.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Message</label>
                <textarea
                  placeholder="How can we help you?"
                  rows={4}
                  {...register("message")}
                  className="w-full p-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-[#003b73]/10 focus:border-[#003b73] focus:outline-none resize-none transition-all"
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.message.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#003b73] text-white font-bold py-2.5 rounded-xl hover:bg-[#002b5b] hover:-translate-y-0.5 shadow-md shadow-[#003b73]/10 active:scale-[0.98] transition-all duration-200"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              <p className="text-[12px] text-neutral-400 text-center mt-2">
                Messages are sent to <span className="text-neutral-500 font-semibold">info@rentflow360.com</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
