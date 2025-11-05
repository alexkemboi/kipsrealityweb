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
      <div className="mb-4">
        <Link
          href="/property-manager/view-own-property"
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

         

          {/* Type-Specific Details */}
          {isApartment && (
  <div className="pt-4 border-t border-gray-200">
    <h2 className="text-lg font-semibold mb-2">Apartment Complex Details</h2>
    <p><strong>Building Name:</strong> {details?.buildingName || "N/A"}</p>
    <p><strong>Total Floors:</strong> {details?.totalFloors || "N/A"}</p>
    <p><strong>Total Units:</strong> {details?.totalUnits || "N/A"}</p>
  </div>
)}

{isHouse && (
  <div className="pt-4 border-t border-gray-200">
    <h2 className="text-lg font-semibold mb-2">House Details</h2>
    <div className="flex items-center gap-3 text-gray-700">
      <div className="flex items-center gap-1">
        <Bed className="w-4 h-4" /> <span>{details?.bedrooms || "N/A"} bedrooms</span>
      </div>
      <div className="flex items-center gap-1">
        <Bath className="w-4 h-4" /> <span>{details?.bathrooms || "N/A"} bathrooms</span>
      </div>
    </div>
    {details?.size && <p className="mt-2"><strong>Size:</strong> {details.size} sqft</p>}
    {details?.numberOfFloors && <p><strong>Floors:</strong> {details.numberOfFloors}</p>}
  </div>
)}

        </CardContent>
      </Card>
    </div>
  );
}
