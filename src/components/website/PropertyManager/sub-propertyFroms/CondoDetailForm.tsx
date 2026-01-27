'use client'
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { HomeIcon } from "lucide-react";
import { Property } from "@/app/data/PropertyData";

interface CondoDetailsSectionProps {
  register: UseFormRegister<Property>;
}

export function CondoDetailForm({ register }: CondoDetailsSectionProps) {
    return (
    <div className="p-6 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg">
          <HomeIcon className="w-6 h-6 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Condo Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="condoName" className="block text-sm font-medium text-gray-700">
            Condo Name
          </label>
          <input
            id="condoName"
            {...register("condoDetail.buildingName")}
            placeholder="e.g., Oceanview Condos"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="floorNumber" className="block text-sm font-medium text-gray-700">
            Floor Number
          </label>
          <input
            id="floorNumber"
            type="number"
            {...register("condoDetail.floorNumber", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-700">
            Unit Number
          </label>
          <input
            id="unitNumber"
            type="text"
            {...register("condoDetail.unitNumber")}
            placeholder="e.g., 12A"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="totalFloorsInBuilding" className="block text-sm font-medium text-gray-700">
            Total Floors in Building
          </label>
          <input
            id="totalFloorsInBuilding"
            type="number"
            {...register("condoDetail.totalFloorsInBuilding", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
            Bedrooms
          </label>
          <input
            id="bedrooms"
            type="number"
            {...register("condoDetail.bedrooms", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
            Bathrooms
          </label>
          <input
            id="bathrooms"
            type="number"
            {...register("condoDetail.bathrooms", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="sizeInSqFt" className="block text-sm font-medium text-gray-700">
            Size (sq ft)
          </label>
          <input
            id="sizeInSqFt"
            type="number"
            {...register("condoDetail.size", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="hoaFees" className="block text-sm font-medium text-gray-700">
            HOA Fees ($)
          </label>
          <input
            id="hoaFees"
            type="number"
            {...register("condoDetail.hoaFees", { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="hasBalcony" className="block text-sm font-medium text-gray-700">
            Has Balcony
          </label>
          <select
            id="hasBalcony"
            {...register("condoDetail.hasBalcony")}
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">
            Amenities
          </label>
          <input
            id="amenities"
            {...register("condoDetail.amenities")}
            placeholder="e.g., Pool, Gym, Parking"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
