"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PropertyType } from "@/app/data/PropertTypeData";
import { fetchPropertyTypes } from "@/lib/property-type";
import { postProperty } from "@/lib/property-post"; 

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
      // You may add static or derived values here (like organizationId, listingId, etc.)
      const payload = {
        ...data,
        organizationId: "org-123", // Replace with actual org ID
        listingId: "listing-123", // Replace or generate dynamically
      };

      const newProperty = await postProperty(payload);
      console.log("Property created:", newProperty);
      reset(); // clear form after submit
      alert("Property created successfully!");
    } catch (error) {
      console.error("Error creating property:", error);
      alert("Failed to create property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create Property Listing</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input {...register("city")} placeholder="City" className="border p-2 rounded w-full placeholder:text-gray-400" />
        <input {...register("address")} placeholder="Address" className="border p-2 rounded w-full placeholder:text-gray-400" />

        <select {...register("propertyTypeId")} className="border p-2 rounded w-full">
          <option value="">Select Property Type</option>
          {propertyTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>

        <input {...register("bedrooms")} type="number" placeholder="Bedrooms" className="border p-2 rounded w-full placeholder:text-gray-400" />
        <input {...register("bathrooms")} type="number" placeholder="Bathrooms" className="border p-2 rounded w-full placeholder:text-gray-400" />
        <input {...register("size")} type="number" placeholder="Size (sqft)" className="border p-2 rounded w-full placeholder:text-gray-400" />
        <input {...register("price")} type="number" placeholder="Price" className="border p-2 rounded w-full placeholder:text-gray-400" />
      </div>

      <textarea
        {...register("amenities")}
        placeholder="Amenities (comma-separated)"
        className="border p-2 rounded w-full mt-4 placeholder:text-gray-400"
      />

      <label className="flex items-center gap-2 mt-4">
        <input type="checkbox" {...register("isFurnished")} />
        <span>Is Furnished?</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mt-6 w-full transition-all ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Submitting..." : "Submit Property"}
      </button>
    </form>
  );
}
