"use client";

import { useEffect, useState } from "react";
import { getProperties } from "@/lib/property-manager";
import { Card, CardContent } from "@/components/ui/card";
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <Card
            key={p.id}
            className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 rounded-2xl"
          >
            <CardContent className="p-5 space-y-3">
              {/* Icon + Property Type */}
              <div className="flex items-center gap-2">
                {p.type?.toLowerCase() === "apartment" ? (
                  <Building2 className="text-blue-600 w-5 h-5" />
                ) : (
                  <Home className="text-green-600 w-5 h-5" />
                )}
                <span className="font-medium text-gray-700 capitalize">{p.type}</span>
              </div>

              {/* Name + Address */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{p.name}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {p.city}, {p.address}
                </div>
              </div>

              {/* Details */}
              <div className="text-sm text-gray-600 space-y-1">
                {p.type?.toLowerCase() === "apartment" && (
                  <>
                    <p>Building: {p.details?.buildingName || "N/A"}</p>
                    <p>Total Floors: {p.details?.totalFloors || "N/A"}</p>
                    <p>Total Units: {p.details?.totalUnits || "N/A"}</p>
                  </>
                )}

                {p.type?.toLowerCase() === "house" && (
                  <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{p.details?.bedrooms || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{p.details?.bathrooms || "N/A"}</span>
                    </div>
                    <span>{p.details?.size ? `${p.details.size} sqft` : ""}</span>
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t text-xs text-gray-500">
                Status: {p.availabilityStatus || "Unknown"} •{" "}
                {p.isFurnished ? "Furnished" : "Unfurnished"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
