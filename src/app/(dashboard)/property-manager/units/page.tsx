"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface Unit {
  id: string | null; // null if placeholder
  unitNumber: number;
  bedrooms: number | null;
  bathrooms: number | null;
  size: number | null;
}

export default function ManageUnitsPage() {
  const { id, type } = useParams(); // id = apartmentComplexDetailId or houseDetailId, type = "apartment" | "house"
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !type) return;

    const queryParam =
      type === "apartment"
        ? `apartmentComplexDetailId=${id}`
        : `houseDetailId=${id}`;

    fetch(`/api/units?${queryParam}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch units");
        return res.json();
      })
      .then((data: Unit[]) => setUnits(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load units");
      })
      .finally(() => setLoading(false));
  }, [id, type]);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading units...</p>;

  if (error)
    return <p className="text-center mt-10 text-red-500">{error}</p>;

  if (units.length === 0)
    return <p className="text-center mt-10 text-gray-500">No units found.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {units.map((unit) => (
        <Card
          key={unit.unitNumber}
          className="shadow hover:shadow-lg transition-shadow rounded-xl border border-gray-200"
        >
          <CardContent className="space-y-3">
            <h2 className="font-semibold text-lg text-gray-800">
              Unit {unit.unitNumber}
            </h2>

            {unit.id ? (
              <div className="text-gray-700 space-y-1">
                <p>
                  <strong>Bedrooms:</strong> {unit.bedrooms ?? "N/A"}
                </p>
                <p>
                  <strong>Bathrooms:</strong> {unit.bathrooms ?? "N/A"}
                </p>
                <p>
                  <strong>Size:</strong> {unit.size ?? "N/A"} sqft
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No details yet</p>
            )}

            <Link
              href={`/property-manager/${type}-details/${id}/units/${
                unit.id ?? unit.unitNumber
              }/edit`}
              className="inline-block mt-2 w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              {unit.id ? "Edit Unit" : "Add Unit Details"}
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
