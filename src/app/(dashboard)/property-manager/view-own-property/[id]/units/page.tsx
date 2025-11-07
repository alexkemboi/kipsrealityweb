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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏢</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Units Found</h3>
          <p className="text-gray-600 mb-6">
            This property doesn't have any units defined yet. Start by adding units to manage them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Units</h1>
        <p className="text-gray-600">
          View and manage all units for this property. {units.length} unit{units.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-blue-200"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      Unit {unit.unitNumber}
                    </h2>
                    {unit.unitName && (
                      <p className="text-gray-600 text-sm mt-1 font-medium">
                        {unit.unitName}
                      </p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    unit.isOccupied 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}>
                    {unit.isOccupied ? "Occupied" : "Vacant"}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    unit.isOccupied ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {unit.isOccupied ? "Currently rented" : "Available for rent"}
                  </span>
                </div>
              </div>

              {/* Unit Details */}
              <div className="p-6">
                {hasDetails ? (
                  <div className="space-y-4">
                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-2xl mb-1">🛏️</div>
                        <div className="font-bold text-gray-900 text-lg">{unit.bedrooms || 0}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Rooms</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-2xl mb-1">🚿</div>
                        <div className="font-bold text-gray-900 text-lg">{unit.bathrooms || 0}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Baths</div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-2">
                      {unit.floorNumber && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center">
                            <span className="mr-2">🏢</span>
                            Floor
                          </span>
                          <span className="font-semibold text-gray-900">{unit.floorNumber}</span>
                        </div>
                      )}
                      {unit.rentAmount && (
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                          <span className="text-gray-600 flex items-center">
                            <span className="mr-2">💰</span>
                            Monthly Rent
                          </span>
                          <span className="font-bold text-blue-600">
                            KSh {unit.rentAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Empty State for Unit */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl text-gray-400">📝</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                      No details added yet
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
             
              <div className="px-6 pb-6">
              <Link
                href={`/property-manager/view-own-property/${propertyId}/units/${unit.unitNumber}/edit`}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-center block ${
                  hasDetails
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                {hasDetails ? "Edit Details" : "Add Details"}
              </Link>

              {/* List Unit Button */}
              <Link
                href={`/property-manager/view-own-property/${propertyId}/units/${unit.unitNumber}/list`}
                className="w-full py-3 px-4 rounded-xl font-semibold text-center block bg-green-500 hover:bg-green-600 text-white"
              >
                List This Unit
              </Link>
            </div>

            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Property Summary</h3>
            <p className="text-gray-600 text-sm">
              {units.filter(unit => unit.isOccupied).length} of {units.length} units occupied
            </p>
          </div>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {units.filter(unit => unit.rentAmount).length}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Rented</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {units.reduce((total, unit) => total + (unit.bedrooms || 0), 0)}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Total Rooms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}