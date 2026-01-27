'use client'
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Property } from "@/app/data/PropertyData";

interface ApartmentDetailsSectionProps {
  register: UseFormRegister<Property>;
}

export function ApartmentDetailForm({ register }: ApartmentDetailsSectionProps) {
  return (
    <div className="p-6 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg">
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Apartment Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="buildingName" className="block text-sm font-medium text-gray-700">
            Building Name
          </label>
          <input
            id="buildingName"
            {...register("apartmentComplexDetail.buildingName")}
            placeholder="e.g., Skyline Towers"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700">
            Total Floors
          </label>
          <input
            id="totalFloors"
            type="number"
            {...register("apartmentComplexDetail.totalFloors", { valueAsNumber: true })}
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
            {...register("apartmentComplexDetail.unitNumber")}
            placeholder="e.g., 101"
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
            {...register("apartmentComplexDetail.size", { valueAsNumber: true })}
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
            {...register("apartmentComplexDetail.bedrooms", { valueAsNumber: true })}
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
            {...register("apartmentComplexDetail.bathrooms", { valueAsNumber: true })}
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
            {...register("apartmentComplexDetail.totalUnits", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="zoning" className="block text-sm font-medium text-gray-700">
            Zoning Type
          </label>
          <input
            id="zoning"
            {...register("apartmentComplexDetail.zoning")}
            placeholder="e.g., Residential, Mixed-Use"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}