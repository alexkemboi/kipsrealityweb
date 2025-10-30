"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {PropertyType} from "@/app/data/PropertTypeData"
import {fetchPropertyTypes} from "@/lib/property-type"



export default function PropertyForm() {
  const { register, handleSubmit } = useForm();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  useEffect(() => {
  const getPropertyTypes = async () => {
    try {
      const data = await fetchPropertyTypes(); 
      setPropertyTypes(data);
    } catch (error) {
      console.error("Failed to fetch property types:", error);
    }
  };

  getPropertyTypes(); 
}, []);

  const onSubmit = (data: any) => {
    console.log("Property form data:", data);
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

        <input
          {...register("bedrooms")}
          type="number"
          placeholder="Bedrooms"
          className="border p-2 rounded w-full placeholder:text-gray-400"
        />
        <input
          {...register("bathrooms")}
          type="number"
          placeholder="Bathrooms"
          className="border p-2 rounded w-full placeholder:text-gray-400"
        />
        <input {...register("size")} type="number" placeholder="Size (sqft)" className="border p-2 rounded w-full placeholder:text-gray-400" />
        <input {...register("price")} type="number" placeholder="Price" className="border p-2 rounded w-full placeholder:text-gray-400" />
      </div>

      <textarea
        {...register("amenities")}
        placeholder="Amenities (comma-separated)"
        className="border p-2 rounded w-full mt- placeholder:text-gray-400"
      />

      <label className="flex items-center gap-2 mt-4">
        <input type="checkbox" {...register("isFurnished")} />
        <span>Is Furnished?</span>
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mt-6 w-full transition-all"
      >
        Submit Property
      </button>
    </form>
  );
}
