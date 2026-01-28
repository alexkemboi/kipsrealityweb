'use client'
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { HomeIcon } from "lucide-react";
import { Property } from "@/app/data/PropertyData";

interface LandDetailsSectionProps {
  register: UseFormRegister<Property>;
}

export function LandDetailForm({ register }: LandDetailsSectionProps) {
    return (
    <div className="p-6 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg">
          <HomeIcon className="w-6 h-6 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Land Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="landSize" className="block text-sm font-medium text-gray-700">
            Lot Size (acres)
          </label>
          <input
            id="lotSize"
            type="number"
            step="0.01"
            {...register("landDetail.lotSize", { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>


        <div className="space-y-2">
          <label htmlFor="zoningType" className="block text-sm font-medium text-gray-700">
            Zoning Type
          </label>
          <input
            id="zoningType"
            {...register("landDetail.zoning")}
            placeholder="e.g., Residential, Commercial"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="space-y-2">
            <label htmlFor="isSubdivided" className="block text-sm font-medium text-gray-700">
                Is Subdivided
            </label>
            <select
                id="isSubdivided"
                {...register("landDetail.isSubdivided")}
                className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
            </select>
        </div>

        <div className="space-y-2">
            <label htmlFor="hasUtilities" className="block text-sm font-medium text-gray-700">
                Has Utilities
            </label>
            <select
                id="hasUtilities"
                {...register("landDetail.hasUtilities")}
                className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
            </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="topography" className="block text-sm font-medium text-gray-700">
            Topography
          </label>
          <input
            id="topography"
            {...register("landDetail.topography")}
            placeholder="e.g., Flat, Hilly"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="soilType" className="block text-sm font-medium text-gray-700">
            Soil Type
          </label>
          <input
            id="soilType"
            {...register("landDetail.soilType")}
            placeholder="e.g., Sandy, Clay"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
            <label htmlFor="accessRoad" className="block text-sm font-medium text-gray-700">
                Access Road
            </label>
            <select
                id="accessRoad"
                {...register("landDetail.accessRoad")}
                className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
            </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="landUse" className="block text-sm font-medium text-gray-700">
            Land Use
          </label>
          <input
            id="landUse"
            {...register("landDetail.landUse")}
            placeholder="e.g., Agricultural, Residential"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>

    )
}