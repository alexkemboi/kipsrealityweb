"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import { updateUnitDetails } from "@/lib/units";

interface UnitFormData {
  bedrooms: number;
  bathrooms: number;
  floorNumber?: number;
  rentAmount?: number;
  unitName?: string;
  isOccupied?: boolean;
}

export default function EditUnitForm({
  propertyId,
  unitNumber,
  existingUnit,
}: {
  propertyId: string;
  unitNumber: string;
  existingUnit: UnitFormData | null;
}) {
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnitFormData>({
    defaultValues: existingUnit || {},
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);

  const formattedData = {
  ...data,
  bedrooms: Number(data.bedrooms),
  bathrooms: Number(data.bathrooms),
  floorNumber: data.floorNumber ? Number(data.floorNumber) : null,
  rentAmount: data.rentAmount ? Number(data.rentAmount) : null,
  isOccupied: Boolean(data.isOccupied), 
};


    const result = await updateUnitDetails(propertyId, unitNumber, formattedData);

    if (result.success) {
      toast.success("Unit details saved successfully!");
      setTimeout(() => router.back(), 1000);
    } else {
      toast.error("Failed to save unit details.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-8 transition-all duration-300">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-lg">#{unitNumber}</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Edit Unit Details
        </h1>
        <p className="text-gray-600 text-sm">Update the information for this rental unit</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Grid Layout for Related Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unit Name */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Unit Name
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("unitName")}
                placeholder="e.g. Apartment A1"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
              
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Bedrooms
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("bedrooms", { 
                  required: "Number of bedrooms is required",
                  min: { value: 0, message: "Must be 0 or more" }
                })}
                placeholder="e.g. 2"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
              
            </div>
            {errors.bedrooms && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.bedrooms.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Bathrooms
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("bathrooms", { 
                  required: "Number of bathrooms is required",
                  min: { value: 0, message: "Must be 0 or more" }
                })}
                placeholder="e.g. 1"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
              
            </div>
            {errors.bathrooms && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.bathrooms.message}</p>
            )}
          </div>

          {/* Floor Number & Rent Amount */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Floor Number
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("floorNumber", { min: 0 })}
                placeholder="e.g. 3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
              
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Rent Amount (KSh)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500 font-semibold">KSh</span>
              <input
                type="number"
                step="0.01"
                {...register("rentAmount", { min: 0 })}
                placeholder="e.g. 25000"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Occupied Checkbox with Enhanced Styling */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 transition-all duration-200 hover:bg-blue-100">
          <label className="flex items-center space-x-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                {...register("isOccupied")}
                className="sr-only peer"
              />
              <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 flex items-center justify-center">
                <svg 
                  className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-gray-700 font-semibold">Currently Occupied</span>
              <p className="text-gray-600 text-sm mt-1">Click this if the unit is currently rented out</p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-xl font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 flex items-center justify-center ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}