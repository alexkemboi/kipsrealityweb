'use client'
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { HomeIcon } from "lucide-react";
import { Property } from "@/app/data/PropertyData";

interface TownhouseDetailsSectionProps {
  register: UseFormRegister<Property>;
}

export function TownhouseDetailForm({ register }: TownhouseDetailsSectionProps) {
    return (
    <div className="p-6 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg">
          <HomeIcon className="w-6 h-6 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Townhouse Details</h2>
      </div>

        //townhouseDetail.townhouseName
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="townhouseName" className="block text-sm font-medium text-gray-700">
            Townhouse Name
          </label>
          <input
            id="townhouseName"
            {...register("townhouseDetail.townhouseName")}
            placeholder="e.g., Maplewood Townhouses"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        //townhouseDetail.numberOfFloors
        <div className="space-y-2">
          <label htmlFor="numberOfFloors" className="block text-sm font-medium text-gray-700">
            Number of Floors
          </label>
          <input
            id="numberOfFloors"
            type="number"
            {...register("townhouseDetail.numberOfFloors", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        //townhouseDetail.bedrooms
        <div className="space-y-2">
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
            Bedrooms
          </label>
          <input
            id="bedrooms"
            type="number"
            {...register("townhouseDetail.bedrooms", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        //townhouseDetail.bathrooms
        <div className="space-y-2">
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
            Bathrooms
          </label>
          <input
            id="bathrooms"
            type="number"
            {...register("townhouseDetail.bathrooms", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        //townhouseDetail.size (sqft)
        <div className="space-y-2">
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">
            Size (sqft)
          </label>
          <input
            id="size"
            type="number"
            {...register("townhouseDetail.size", { valueAsNumber: true })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div> 

        //townhouseDetail.unitNumber
        <div className="space-y-2">
          <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-700">
            Unit Number
          </label>
          <input
            id="unitNumber"
            type="text"
            {...register("townhouseDetail.unitNumber")}
            placeholder="e.g., 5B"
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        //townhouseDetail.endUnit (true/false)
        <div className="space-y-2">
          <label htmlFor="endUnit" className="block text-sm font-medium text-gray-700">
            Is End Unit
          </label>
          <select
            id="endUnit"
            {...register("townhouseDetail.endUnit")}
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>     
        </div>    
      </div>
    </div>
    )
}