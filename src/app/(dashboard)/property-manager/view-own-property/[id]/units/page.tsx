// src/app/(dashboard)/property-manager/view-own-property/[id]/units/page.tsx
import { fetchUnits } from "@/lib/units";
import Link from "next/link";

export default async function ManageUnitsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id: propertyId } = await params;
  const { type } = await searchParams;

  const units = await fetchUnits(propertyId);

  if (units.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No units defined for this property.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {units.map((unit) => {
        const hasDetails =
          unit.unitName ||
          unit.bedrooms ||
          unit.bathrooms ||
          unit.floorNumber ||
          unit.rentAmount;

        return (
          <div
            key={unit.unitNumber}
            className="shadow hover:shadow-lg transition-shadow rounded-xl border border-gray-200 p-5 bg-white flex flex-col justify-between"
          >
            <div>
              <h2 className="font-semibold text-lg text-gray-800 mb-1">
                Unit {unit.unitNumber}
                {unit.unitName && (
                  <span className="text-gray-600 text-base font-normal">
                    {" "}
                    – {unit.unitName}
                  </span>
                )}
              </h2>

              <p
                className={`text-sm font-medium ${
                  unit.isOccupied ? "text-green-600" : "text-gray-500"
                }`}
              >
                {unit.isOccupied ? "🟢 Occupied" : "⚪ Vacant"}
              </p>

              {hasDetails && (
                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>Bedrooms: {unit.bedrooms || "-"}</p>
                  <p>Bathrooms: {unit.bathrooms || "-"}</p>
                  <p>Floor: {unit.floorNumber || "-"}</p>
                  <p>Rent: {unit.rentAmount ? `KSh ${unit.rentAmount}` : "-"}</p>
                </div>
              )}
            </div>

            <Link
              href={`/property-manager/view-own-property/${propertyId}/units/${unit.unitNumber}/edit`}
              className={`mt-5 block w-full text-center px-4 py-2 rounded-lg font-medium transition ${
                hasDetails
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {hasDetails ? "Update Unit Details" : "Add Unit Details"}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
