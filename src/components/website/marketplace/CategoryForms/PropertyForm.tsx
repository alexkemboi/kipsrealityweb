"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PropertyType } from "@/app/data/PropertTypeData";
import { fetchPropertyTypes } from "@/lib/property-type";
import { postProperty } from "@/lib/property-post";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import { HomeIcon } from "lucide-react";

export default function PropertyForm() {
  const { register, handleSubmit, reset } = useForm();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPropertyTypes = async () => {
      const data = await fetchPropertyTypes();
      setPropertyTypes(data);
    };
    getPropertyTypes();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        organizationId: "org-123", 
        listingId: "listing-123",
      };

      const newProperty = await postProperty(payload);
      console.log("Property created:", newProperty);
      reset();
      alert("Property created successfully!");
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Failed to create property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <Navbar />

      {/* Banner */}
      <section className="relative w-full bg-[#18181a] text-white py-28 text-center overflow-hidden mb-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/60 to-indigo-600/60 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Create Property Listing
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Showcase your property to potential buyers or renters.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 -mt-20 mb-20">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 text-white rounded-full shadow-lg">
              <HomeIcon className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Property Details
            </h2>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-6"
          >
            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                {...register("city")}
                placeholder="City"
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full placeholder-gray-400"
              />
              <input
                {...register("address")}
                placeholder="Address"
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full placeholder-gray-400"
              />

              <select
                {...register("propertyTypeId")}
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full text-gray-700"
              >
                <option value="">Select Property Type</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>

              <input
                {...register("bedrooms")}
                type="number"
                placeholder="Bedrooms"
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full placeholder-gray-400"
              />
              <input
                {...register("bathrooms")}
                type="number"
                placeholder="Bathrooms"
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full placeholder-gray-400"
              />
              <input
                {...register("size")}
                type="number"
                placeholder="Size (sqft)"
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full placeholder-gray-400"
              />
              <input
                {...register("price")}
                type="number"
                placeholder="Price"
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full placeholder-gray-400"
              />
            </div>

            {/* Amenities */}
            <div>
              <textarea
                {...register("amenities")}
                placeholder="Amenities (comma-separated)"
                className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-xl p-3 w-full placeholder-gray-400 h-32"
              />
            </div>

            {/* Furnished Checkbox */}
            <label className="flex items-center gap-3 mt-4 text-gray-700">
              <input
                type="checkbox"
                {...register("isFurnished")}
                className="h-5 w-5 accent-blue-600"
              />
              <span className="text-lg">Is Furnished?</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Property"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
