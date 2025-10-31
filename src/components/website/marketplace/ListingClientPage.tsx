"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Grid } from "lucide-react"; // 🔥 Add icons
import { MarketplaceItem } from "@/app/data/marketplaceData";

interface MarketplaceClientPageProps {
  listings: MarketplaceItem[];
}

export function MarketplaceClientPage({ listings }: MarketplaceClientPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  const uniqueLocations = ["all", ...new Set(listings.map((item) => item.location))];
  const uniqueCategories = ["all", ...new Set(listings.map((item) => item.category))];

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesLocation = filterLocation === "all" || item.location === filterLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* 🔍 Search + Filters Card */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 mb-12 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full md:w-1/4">
            <Grid className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="relative w-full md:w-1/4">
            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            >
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "all" ? "All Locations" : loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 🏠 Listings */}
      {filteredListings.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={300}
                className="object-cover w-full h-60"
              />
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-xl text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-blue-600 font-semibold">
                    KES {item.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">{item.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-16">No listings found.</p>
      )}
    </div>
  );
}
