
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
    
    <section className="max-w-6xl flex imx-auto p-6 md:p-10 ">

      <Link
      href="/marketplace"
      className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </Link>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ">

<div className="relative w-full aspect-video overflow-hidden">
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
          <div className="text-gray-700 leading-relaxed mb-8">
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
    </section>
  );
}
