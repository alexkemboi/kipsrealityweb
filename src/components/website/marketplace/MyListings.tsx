"use client";

import React, { useState } from "react";
import { MarketplaceItem } from "@/app/data/marketplaceData";
import { MoreHorizontal, MapPin, Edit, Trash } from "lucide-react";

interface MarketplaceClientPageProps {
  listings: MarketplaceItem[];
}

export function MyListings({ listings }: MarketplaceClientPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <section className="container mx-auto px-4 py-16">
     

      {listings.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-5 bg-gray-100 px-6 py-4 font-semibold text-gray-700 text-sm">
            <div>Image</div>
            <div>Title</div>
            <div>Price</div>
            <div>Location</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {listings.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-5 items-center px-6 py-4 hover:bg-gray-50 transition-all duration-200"
              >
                {/* Image */}
                <div className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                  />
                </div>

                {/* Title */}
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {item.category}
                  </p>
                </div>

                {/* Price */}
                <div className="font-semibold text-gray-800">
                  KES {item.price.toLocaleString()}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {item.location}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition">
                    <Trash className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-lg text-gray-500">
            You don't have any listings at the moment.
          </p>
        </div>
      )}
    </section>
  );
}
