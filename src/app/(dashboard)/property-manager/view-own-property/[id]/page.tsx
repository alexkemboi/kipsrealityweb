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

  const isApartment =
    property.propertyType?.name?.toLowerCase() === "apartment";
  const isHouse = property.propertyType?.name?.toLowerCase() === "house";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back link */}
      <div className="mb-4">
        <Link
          href="/property-manager"
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Properties
        </Link>
      </div>

      <Card className="border border-gray-200 rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            {isApartment ? (
              <Building2 className="text-blue-600 w-6 h-6" />
            ) : (
              <Home className="text-green-600 w-6 h-6" />
            )}
            <h1 className="text-2xl font-semibold text-gray-800">
              {property.name}
            </h1>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {property.city}, {property.address}
            </span>
          </div>

          {/* Property Info */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <p>
              <strong>Type:</strong> {property.propertyType?.name || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {property.availabilityStatus || "Unknown"}
            </p>
            <p>
              <strong>Furnished:</strong>{" "}
              {property.isFurnished ? "Yes" : "No"}
            </p>
            {property.amenities && (
              <p>
                <strong>Amenities:</strong> {property.amenities}
              </p>
            )}
          </div>

          {/* Type-Specific Details */}
          {isApartment && (
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-2">
                Apartment Complex Details
              </h2>
              <p>
                <strong>Building Name:</strong>{" "}
                {property.apartmentComplexDetail?.buildingName || "N/A"}
              </p>
              <p>
                <strong>Total Floors:</strong>{" "}
                {property.apartmentComplexDetail?.totalFloors || "N/A"}
              </p>
              <p>
                <strong>Total Units:</strong>{" "}
                {property.apartmentComplexDetail?.totalUnits || "N/A"}
              </p>
            </div>
          )}

          {isHouse && (
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-2">House Details</h2>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />{" "}
                  <span>{property.houseDetail?.bedrooms || "N/A"} bedrooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />{" "}
                  <span>{property.houseDetail?.bathrooms || "N/A"} bathrooms</span>
                </div>
              </div>
              {property.houseDetail?.size && (
                <p className="mt-2">
                  <strong>Size:</strong> {property.houseDetail.size} sqft
                </p>
              )}
              {property.houseDetail?.numberOfFloors && (
                <p>
                  <strong>Floors:</strong>{" "}
                  {property.houseDetail.numberOfFloors}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
