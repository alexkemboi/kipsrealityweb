"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { updateUnitDetails, fetchUnitDetails } from "@/lib/units";

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
}: {
  propertyId: string;
  unitNumber: string;
}) {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<UnitFormData>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Prefill form if unit data exists
  useEffect(() => {
    const loadUnitData = async () => {
      const unit = await fetchUnitDetails(propertyId, unitNumber);
      if (unit) reset(unit);
    };
    loadUnitData();
  }, [propertyId, unitNumber, reset]);

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);
    setMessage("");

    const formattedData = {
      ...data,
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      floorNumber: data.floorNumber ? Number(data.floorNumber) : null,
      rentAmount: data.rentAmount ? Number(data.rentAmount) : null,
    };

    const result = await updateUnitDetails(propertyId, unitNumber, formattedData);

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
        {`Edit Details for Unit ${unitNumber}`}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-gray-700 mb-1">Unit Name</label>
          <input
            type="text"
            {...register("unitName")}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Bedrooms</label>
          <input
            type="number"
            {...register("bedrooms", { required: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Bathrooms</label>
          <input
            type="number"
            {...register("bathrooms", { required: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Floor Number</label>
          <input
            type="number"
            {...register("floorNumber")}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Rent Amount</label>
          <input
            type="number"
            step="0.01"
            {...register("rentAmount")}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* ✅ Occupied status */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("isOccupied")}
            className="w-4 h-4 text-blue-600"
          />
          <label className="text-gray-700">Is this unit occupied?</label>
        </div>

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
