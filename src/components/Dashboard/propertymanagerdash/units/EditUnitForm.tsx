"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { updateUnitDetails } from "@/lib/units";

export interface ApplianceInput {
  name: string;
}

export interface UnitFormData {
  bedrooms: number;
  bathrooms: number;
  floorNumber?: number | null;
  rentAmount?: number | null;
  unitName?: string;
  currency?: string;
  isOccupied?: boolean;
  appliances?: ApplianceInput[];
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<UnitFormData>({
    defaultValues: {
      bedrooms: existingUnit?.bedrooms || 0,
      bathrooms: existingUnit?.bathrooms || 0,
      floorNumber: existingUnit?.floorNumber || null,
      rentAmount: existingUnit?.rentAmount || null,
      unitName: existingUnit?.unitName || "",
      currency: existingUnit?.currency || "USD",

      isOccupied: existingUnit?.isOccupied || false,
      // appliances will be handled separately
    },
  });

  const [loading, setLoading] = useState(false);
  const [applianceInput, setApplianceInput] = useState("");

  // Initialize appliance input from existing data
  useEffect(() => {
    if (existingUnit?.appliances && existingUnit.appliances.length > 0) {
      const applianceNames = existingUnit.appliances
        .map((appliance) => appliance.name)
        .join(", ");
      setApplianceInput(applianceNames);
    }
  }, [existingUnit]);

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);

    try {
      // Convert appliance string input into structured array for backend
      const appliancesArray: ApplianceInput[] = applianceInput
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const formattedData = {
        ...data,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        floorNumber: data.floorNumber ? Number(data.floorNumber) : null,
        rentAmount: data.rentAmount ? Number(data.rentAmount) : null,
        appliances: appliancesArray,
      };

      const result = await updateUnitDetails(propertyId, unitNumber, formattedData);

      if (result.success) {
        toast.success("Unit details saved successfully!");
        setTimeout(() => router.back(), 1000);
      } else {
        toast.error(result.message || "Failed to save unit details.");
      }
    } catch (error: any) {
      toast.error("An error occurred while saving unit details.");
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-8 transition-all duration-300">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-lg">#{unitNumber}</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Edit Unit Details
        </h1>
        <p className="text-gray-600 text-sm">
          Update the information for this rental unit
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unit Name */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Unit Name
            </label>
            <input
              type="text"
              {...register("unitName")}
              placeholder="e.g. Apartment A1"
              className="w-full px-4 py-3 rounded-xl border placeholder:text-gray-400 border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Bedrooms *
            </label>
            <input
              type="number"
              min="0"
              {...register("bedrooms", {
                required: "Number of bedrooms is required",
                min: { value: 0, message: "Bedrooms cannot be negative" }
              })}
              placeholder="e.g. 2"
              className="w-full px-4 py-3 rounded-xl border placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            {errors.bedrooms && (
              <p className="text-red-500 text-xs mt-1">{errors.bedrooms.message}</p>
            )}
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Bathrooms *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              {...register("bathrooms", {
                required: "Number of bathrooms is required",
                min: { value: 0, message: "Bathrooms cannot be negative" }
              })}
              placeholder="e.g. 1.5"
              className="w-full px-4 py-3 rounded-xl border placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            {errors.bathrooms && (
              <p className="text-red-500 text-xs mt-1">{errors.bathrooms.message}</p>
            )}
          </div>

          {/* Floor Number */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Floor Number
            </label>
            <input
              type="number"
              min="0"
              {...register("floorNumber")}
              placeholder="e.g. 3"
              className="w-full px-4 py-3 rounded-xl border placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rent Amount */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Rent Amount
            </label>
            <div className="flex gap-2">
              <select
                {...register("currency")}
                className="w-1/3 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                defaultValue="USD"
              >
                <option value="USD">USD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>


              <input
                type="number"
                min="0"
                step="0.01"
                {...register("rentAmount", { valueAsNumber: true })}
                placeholder="e.g. 25000"
                className="w-2/3 px-4 py-3 rounded-xl border placeholder:text-gray-400 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Appliances */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Appliances
            </label>
            <input
              type="text"
              value={applianceInput}
              onChange={(e) => setApplianceInput(e.target.value)}
              placeholder="e.g. Fridge, Microwave, Washing Machine"
              className="w-full px-4 py-3 rounded-xl border placeholder:text-gray-400 border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple appliances with commas (,)
            </p>
          </div>



        </div>

        {/* Occupied */}
        <div className="flex items-center gap-3 mt-4">
          <input
            type="checkbox"
            {...register("isOccupied")}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700 font-medium">Currently Occupied</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-xl text-white font-semibold shadow-md transition-all ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] hover:shadow-lg"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}