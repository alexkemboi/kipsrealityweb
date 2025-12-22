'use client'
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { HomeIcon } from "lucide-react";
import { Property } from "@/app/data/PropertyData";

interface HouseDetailsSectionProps {
  register: UseFormRegister<Property>;
}

export function HouseDetailForm({ register }: HouseDetailsSectionProps) {
  return (
    <div className="p-6 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg">
          <HomeIcon className="w-6 h-6 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">House Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="houseName" className="block text-sm font-medium text-gray-700">
            House Name
          </label>
          <input
            id="houseName"
            {...register("houseDetail.houseName")}
            placeholder="e.g., Villa Sunrise"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="numberOfFloors" className="block text-sm font-medium text-gray-700">
            Number of Floors
          </label>
          <input
            id="numberOfFloors"
            type="number"
            {...register("houseDetail.numberOfFloors", { valueAsNumber: true })}
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
            {...register("houseDetail.bedrooms", { valueAsNumber: true })}
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
            {...register("houseDetail.bathrooms", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            Size (sqft)
          </label>
          <input
            id="size"
            type="number"
            {...register("houseDetail.size", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="totalUnits" className="block text-sm font-medium text-gray-700">
            Total Units
          </label>
          <input
            id="totalUnits"
            type="number"
            {...register("houseDetail.totalUnits", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}