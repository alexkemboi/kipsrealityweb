"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { updateUnitDetails } from "@/lib/units";
import { Appliance, Unit } from "@/app/data/UnitData";

// Form interface aligned with backend expectations
interface UnitFormData {
  bedrooms: number;
  bathrooms: number;
  floorNumber?: number | null;
  rentAmount?: number | null;
  unitName?: string;
  isOccupied?: boolean;
  appliances?: string; // ✅ Send as comma-separated string
}

export default function EditUnitForm({
  propertyId,
  unitNumber,
  existingUnit,
}: {
  propertyId: string;
  unitNumber: string;
  existingUnit: (Unit & { appliances?: Appliance[] }) | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Preprocess appliances for display as string
  const defaultValues: UnitFormData = {
    bedrooms: existingUnit?.bedrooms ?? 0,
    bathrooms: existingUnit?.bathrooms ?? 0,
    floorNumber: existingUnit?.floorNumber ?? null,
    rentAmount: existingUnit?.rentAmount ?? null,
    unitName: existingUnit?.unitName ?? "",
    isOccupied: existingUnit?.isOccupied ?? false,
    appliances: existingUnit?.appliances
      ?.map((a) => a.name)
      .join(", ") ?? "", // ✅ Convert appliance array to comma-separated string
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormData>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [existingUnit]);

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);

    const formattedData = {
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      floorNumber: data.floorNumber ? Number(data.floorNumber) : null,
      rentAmount: data.rentAmount ? Number(data.rentAmount) : null,
      isOccupied: Boolean(data.isOccupied),
      unitName: data.unitName || undefined,
      appliances: data.appliances || "", // ✅ Pass as string (backend splits it)
    };

    const result = await updateUnitDetails(propertyId, unitNumber, formattedData);

    if (result.success) {
      toast.success("Unit details saved successfully!");
      setTimeout(() => router.back(), 1000);
    } else {
      toast.error(result.message || "Failed to save unit details.");
    }

    setLoading(false);
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
        <p className="text-gray-600 text-sm">Update the information for this rental unit</p>
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
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Bedrooms
            </label>
            <input
              type="number"
              {...register("bedrooms", {
                required: "Number of bedrooms is required",
                min: { value: 0, message: "Must be 0 or more" },
              })}
              placeholder="e.g. 2"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
            {errors.bedrooms && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.bedrooms.message}</p>
            )}
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Bathrooms
            </label>
            <input
              type="number"
              {...register("bathrooms", {
                required: "Number of bathrooms is required",
                min: { value: 0, message: "Must be 0 or more" },
              })}
              placeholder="e.g. 1"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
            {errors.bathrooms && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.bathrooms.message}</p>
            )}
          </div>

          {/* Floor Number */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Floor Number
            </label>
            <input
              type="number"
              {...register("floorNumber", { min: 0 })}
              placeholder="e.g. 3"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>

          {/* Rent Amount */}
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

          {/* Appliances */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2 font-semibold text-sm uppercase tracking-wide">
              Appliances
            </label>
            <input
              type="text"
              {...register("appliances")}
              placeholder="e.g. Fridge, Microwave, TV"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
            <p className="text-gray-500 text-xs mt-1">
              Enter multiple appliances separated by commas
            </p>
          </div>
        </div>

        {/* Occupied Checkbox */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 transition-all duration-200 hover:bg-blue-100">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("isOccupied")}
              className="w-5 h-5 border-gray-300 rounded-md text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-semibold">Currently Occupied</span>
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
              <>Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
