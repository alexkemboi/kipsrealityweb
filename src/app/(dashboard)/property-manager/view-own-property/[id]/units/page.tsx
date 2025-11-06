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
      {units.map((unit) => (
        <div
          key={unit.unitNumber}
          className="shadow hover:shadow-lg transition-shadow rounded-xl border border-gray-200 p-5 bg-white"
        >
          <h2 className="font-semibold text-lg text-gray-800">
            Unit {unit.unitNumber}
          </h2>

          <Link
            href={`/property-manager/view-own-property/${propertyId}/units/${unit.unitNumber}/edit`}
            className="block mt-4 w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Add Unit Details
          </Link>
        </div>
      ))}
    </div>
  );
}
