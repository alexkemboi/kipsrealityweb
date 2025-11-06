"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPropertyById } from "@/lib/property-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Home, MapPin, Bed, Bath, ArrowLeft } from "lucide-react";

export default function ViewPropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(id as string);
        setProperty(data);
      } catch (err: any) {
        setError("Failed to fetch property");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading)
    return <div className="text-center text-gray-500 mt-10">Loading property...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!property)
    return <div className="text-center text-gray-500 mt-10">Property not found</div>;

  const isApartment = property.type?.toLowerCase() === "apartment";
  const isHouse = property.type?.toLowerCase() === "house";
  const details = property.propertyDetails;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/property-manager/view-own-property"
          className="flex items-center text-blue-600 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Properties
        </Link>
      </div>

      <Card className="border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            {isApartment ? (
              <Building2 className="text-blue-600 w-6 h-6" />
            ) : (
              <Home className="text-green-600 w-6 h-6" />
            )}
            <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
          </div>

          {/* Address & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{property.city}, {property.address}</span>
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${property.isFurnished ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                {property.isFurnished ? "Furnished" : "Unfurnished"}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {property.availabilityStatus || "Unknown"}
              </span>
            </div>
          </div>

          {/* Property Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <p><strong>Type:</strong> {property.type || "N/A"}</p>
            {property.amenities && <p><strong>Amenities:</strong> {property.amenities}</p>}
            <p><strong>Total Units:</strong> {property.totalUnits || 0}</p>
          </div>

          {/* Type-Specific Details */}
          {isApartment && (
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Apartment Complex Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700">
                <p><strong>Building:</strong> {details?.buildingName || "N/A"}</p>
                <p><strong>Floors:</strong> {details?.totalFloors || "N/A"}</p>
                <p><strong>Units:</strong> {details?.totalUnits || "N/A"}</p>
              </div>
            </div>
          )}

          {isHouse && (
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">House Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700">
                <div className="flex items-center gap-1">
                  <Bed className="w-5 h-5" /> <span>{details?.bedrooms || "N/A"} bedrooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-5 h-5" /> <span>{details?.bathrooms || "N/A"} bathrooms</span>
                </div>
                {details?.size && <p><strong>Size:</strong> {details.size} sqft</p>}
                {details?.numberOfFloors && <p><strong>Floors:</strong> {details.numberOfFloors}</p>}
              </div>
            </div>
          )}

          {/* View Units Button */}
          <div className="pt-4 border-t border-gray-200">
            <Link
              href={`/property-manager/view-own-property/${property.id}/units?type=${isApartment ? "apartment" : "house"}`}
              className="inline-block w-full text-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              View Units
            </Link>
            <Link
              href={`/property-manager/view-own-property/${property.id}/manage_units_and_leases`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Manage Units & Leases
            </Link>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
