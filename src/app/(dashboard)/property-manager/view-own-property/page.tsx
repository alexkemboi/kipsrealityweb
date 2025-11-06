"use client";

import { useEffect, useState } from "react";
import { getProperties } from "@/lib/property-manager";
import Link from "next/link";
import { Building2, Home, MapPin, Bed, Bath } from "lucide-react";

export default function PropertyManagerPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data);
      } catch (err: any) {
        setError("Failed to fetch properties");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading properties...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (properties.length === 0) {
    return <div className="text-center text-gray-500 mt-10">No properties found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Properties</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Property</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Details</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map((p) => (
                <tr 
                  key={p.id}
                  className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                  onClick={() => window.location.href = `/property-manager/view-own-property/${p.id}`}
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      {p.type?.toLowerCase() === "apartment" ? (
                        <Building2 className="text-blue-600 w-6 h-6" />
                      ) : (
                        <Home className="text-green-600 w-6 h-6" />
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                          {p.name}
                        </h2>
                        {p.type?.toLowerCase() === "apartment" && p.details?.buildingName && (
                          <p className="text-sm text-blue-600 font-medium mt-1">
                            {p.details.buildingName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                      {p.type}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="max-w-[200px] truncate">
                        {p.city}, {p.address}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    {p.type?.toLowerCase() === "apartment" ? (
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Floors: {p.details?.totalFloors || "N/A"}</div>
                        <div>Units: {p.details?.totalUnits || "N/A"}</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{p.details?.bedrooms || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{p.details?.bathrooms || "N/A"}</span>
                        </div>
                        {p.details?.size && (
                          <span>{p.details.size} sqft</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-5 px-6">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.availabilityStatus === "available" 
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {p.availabilityStatus || "Unknown"}
                      </span>
                      <div className="text-xs text-gray-500">
                        {p.isFurnished ? "Furnished" : "Unfurnished"}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}