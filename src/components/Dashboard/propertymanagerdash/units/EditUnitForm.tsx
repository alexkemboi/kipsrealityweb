"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateUnitDetails } from "@/lib/units";

interface UnitFormData {
  bedrooms: number;
  bathrooms: number;
  floorNumber?: number;
  rentAmount?: number;
  tenantName?: string;
}

export default function EditUnitForm({
  propertyId,
  unitNumber,
}: {
  propertyId: string;
  unitNumber: string;
}) {
  const router = useRouter();
  const { register, handleSubmit } = useForm<UnitFormData>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);
    setMessage("");

    const result = await updateUnitDetails(propertyId, unitNumber, data);

    if (result.success) {
      setMessage("✅ " + result.message);
      setTimeout(() => router.back(), 1500);
    } else {
      setMessage("❌ " + result.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Add Details for Unit {unitNumber}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Bedrooms */}
        <div>
          <label className="block text-gray-700 mb-1">Bedrooms</label>
          <input
            type="number"
            {...register("bedrooms", { required: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-gray-700 mb-1">Bathrooms</label>
          <input
            type="number"
            {...register("bathrooms", { required: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Floor */}
        <div>
          <label className="block text-gray-700 mb-1">Floor Number</label>
          <input
            type="number"
            {...register("floorNumber")}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Rent */}
        <div>
          <label className="block text-gray-700 mb-1">Rent Amount</label>
          <input
            type="number"
            step="0.01"
            {...register("rentAmount")}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Tenant */}
        <div>
          <label className="block text-gray-700 mb-1">Tenant Name (optional)</label>
          <input
            type="text"
            {...register("tenantName")}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Save Unit Details"}
        </button>

        {message && (
          <p className="text-center text-sm mt-3 text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
