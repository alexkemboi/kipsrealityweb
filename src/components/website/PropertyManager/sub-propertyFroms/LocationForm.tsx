'use client'
import React from "react";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { MapPinIcon } from "lucide-react";
import { Property } from "@/app/data/PropertyData";
import { PropertyType } from "@/app/data/PropertTypeData";
import PropertyMap from "@/components/propertyMap/propertyMap";

interface LocationSectionProps {
  register: UseFormRegister<Property>;
  watch: UseFormWatch<Property>;
  propertyTypes: PropertyType[];
  mapLoading: boolean;
  mapCoordinates: { lat: number; lng: number } | null;
  showMap: boolean;
  onMarkerPositionChange: (lat: number, lng: number) => void;
}

export function LocationForm({
  register,
  watch,
  propertyTypes,
  mapLoading,
  mapCoordinates,
  showMap,
  onMarkerPositionChange,
}: LocationSectionProps) {
  const [country, city, latitude, longitude] = watch([
    "country",
    "city",
    "latitude",
    "longitude",
  ]);

  return (
    <div className="rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1">
          <MapPinIcon className="w-5 h-5 text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-500">Provide location details</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            {...register("country")}
            placeholder="Country e.g. United States"
            required
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-500"
          />
          <input
            {...register("city")}
            placeholder="City e.g. New York"
            required
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            {...register("zipCode")}
            placeholder="Zip code e.g. 10001"
            required
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            {...register("address")}
            placeholder="Street Address e.g. 123 Main St"
            required
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {mapLoading && (
          <div className="mt-4 p-5 border-1 border-blue-200 rounded-lg text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-blue-700">
                Loading map for {city}, {country}...
              </p>
            </div>
          </div>
        )}

        {!mapLoading && !mapCoordinates && country && city && (
          <div className="mt-4 p-5 border-1 border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Location not found</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Unable to load map. Please check if the address details are correct.
                </p>
              </div>
            </div>
          </div>
        )}

        {!mapLoading && mapCoordinates && showMap && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-800">
                Pin exact location to get the coordinates (lat & long)
              </label>
              <span className="text-xs text-gray-500 italic">
                Drag the marker to adjust coordinates
              </span>
            </div>
            <div className="border-1 border-gray-200 rounded-lg overflow-hidden">
              <PropertyMap
                initialLat={mapCoordinates.lat}
                initialLng={mapCoordinates.lng}
                onMarkerPositionChange={onMarkerPositionChange}
              />
            </div>
            <div className="flex items-center justify-center gap-6 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Latitude:</span>
                <span className="text-xs font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200">
                  {(latitude || mapCoordinates.lat).toFixed(6)}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Longitude:</span>
                <span className="text-xs font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200">
                  {(longitude || mapCoordinates.lng).toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
            Property Type
          </label>
          <select
            id="propertyType"
            {...register("propertyTypeId")}
            required
            className="w-full px-3 py-2 text-sm bg-white border-1 border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="">Select a property type</option>
            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}