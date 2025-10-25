"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Clock, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketplaceItem } from "@/app/data/marketplaceData";

interface ListingDetailsPageProps {
  listing: MarketplaceItem;
}

export default function MyListing({ listing }: ListingDetailsPageProps) {
  const [editableListing, setEditableListing] = useState(listing);
  const [activeTab, setActiveTab] = useState<"view" | "edit" | "inquiries">("view");

  const handleChange = (field: keyof MarketplaceItem, value: string | number) => {
    setEditableListing((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Listing updated successfully!");
  };

  return (
    <section className="max-w-6xl mx-auto p-6 md:p-10">
      <article className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Image */}
        <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
          <Image
            src={editableListing.image}
            alt={editableListing.title}
            fill
            className="object-cover"
          />
        </div>

    {/* Tabs */}
<div className="mt-8 border-b border-gray-200 flex divide-x divide-gray-300 rounded-t-xl overflow-hidden">
  {["view", "edit", "inquiries"].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab as "view" | "edit" | "inquiries")}
      className={`flex-1 py-3 text-sm font-semibold transition-colors
        ${
          activeTab === tab
            ? "text-blue-600 border-b-2 border-blue-600 bg-gray-50"
            : "text-gray-500 hover:text-gray-700"
        }`}
    >
      {tab === "view"
        ? "Overview"
        : tab === "edit"
        ? "Edit Listing"
        : "Inquiries"}
    </button>
  ))}
</div>


        {/* Content Area */}
        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            {activeTab === "view" && (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Title & Price */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {editableListing.title}
                  </h1>
                  <p className="text-blue-600 font-semibold text-lg">
                    $ {editableListing.price.toLocaleString()}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {editableListing.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Posted {editableListing.datePosted}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-base font-semibold text-blue-600 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {editableListing.description}
                  </p>
                </div>


                <p className="text-sm text-gray-500 mt-4">
                  <strong>You Posted as:</strong> {editableListing.postedBy}
                </p>
              </motion.div>
            )}

            {activeTab === "edit" && (
              <motion.form
                key="edit"
                onSubmit={handleSave}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Editable Fields */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <input
                    type="text"
                    value={editableListing.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="text-2xl md:text-3xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      style={{ width: `${editableListing.title.length + 2}ch` }}

                  />
                  <input
                    type="number"
                    value={editableListing.price}
                    onChange={(e) => handleChange("price", Number(e.target.value))}
                    className="text-blue-600 font-semibold text-lg bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <input
                  type="text"
                  value={editableListing.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 py-2"
                />

                <textarea
                  value={editableListing.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={5}
                  className="w-full text-gray-900 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />

             

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </motion.form>
            )}

            {activeTab === "inquiries" && (
              <motion.div
                key="inquiries"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Property Inquiries
                </h2>
                <p className="text-gray-600 text-sm">
                  You currently have no inquiries for this property.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </article>
    </section>
  );
}
