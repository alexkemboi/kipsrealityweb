
"use client";

import Image
 from "next/image";
 import Link from "next/link";

 import { MapPin, Clock, ArrowLeft, Phone, Mail } from "lucide-react";
import React from "react";
import {MarketplaceItem}  from "@/app/data/marketplaceData"



interface ListingDetailsPageProps {
  listing:MarketplaceItem;
}
export default function ListingDetailsPage({listing}: ListingDetailsPageProps) {
   
  return (
    
    <section className="max-w-6xl flex flex-col mx-auto p-6 md:p-10 ">


      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ">

<div className="relative w-full h-[300px]  aspect-3/2 overflow-hidden">
<Image
src={listing.image}
alt={listing.title}
fill
className="object-cover transition-transform duration-700 hover:scale-105"
/>

</div>

 {/* Content */}
        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {listing.title}
            </h1>
            <span className="mt-2 md:mt-0 inline-block text-blue-600 font-semibold text-lg">
              ${listing.price}
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-blue-500" />
              {listing.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              Posted {listing.datePosted}
            </span>
          </div>

          {/* Description */}
          <div className="text-black text-lg leading-relaxed mb-8">
            <p className="text-base font-semibold text-blue-600">Description</p>
            <p>{listing.description}</p>
          </div>

          {/* Contact Info */}
          {listing.contact && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <p className="flex items-center gap-2 text-gray-700 text-sm">
                <Phone className="w-4 h-4 text-blue-500" />
                {listing.contact}
              </p>
            </div>
          )}
        </div>
      </article>

      {/* Inquiry Section */}
<div className="mt-10 bg-gray-50 rounded-2xl p-6 border border-gray-200">
  <h2 className="text-xl font-bold text-gray-900 mb-4">
    Send an Inquiry
  </h2>

  <form
    onSubmit={(e) => {
      e.preventDefault();
      alert("Your message has been sent to the seller!");
      (e.target as HTMLFormElement).reset();
    }}
    className="space-y-4"
  >
    <div>
      <label htmlFor="message" className="block text-base font-semibold text-blue-600 mb-2">
        Your Message
      </label>
      <textarea
        id="message"
        rows={4}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-gray-500"
        placeholder="Hi, I'm interested in this listing. Is it still available?"
      />
    </div>

    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
    >
      Send Message
    </button>
  </form>

  <div className="text-center mt-6">
    
  </div>
</div>

    </section>
  );
}
