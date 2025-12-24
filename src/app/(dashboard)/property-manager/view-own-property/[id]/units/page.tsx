// src/app/(dashboard)/property-manager/view-own-property/[id]/units/page.tsx
import { fetchUnits } from "@/lib/units";
import Link from "next/link";
import { Building, Bed, Bath, DollarSign, Users, Home, Wifi, Utensils } from "lucide-react";

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
            <Home className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Units Found</h3>
          <p className="text-gray-600 mb-6">
            This property doesn't have any units defined yet. Start by adding units to manage them.
          </p>
        </div>
      </div>
    );
  }

  const occupiedUnits = units.filter(unit => unit.isOccupied).length;
  const totalRooms = units.reduce((total, unit) => total + (unit.bedrooms || 0), 0);
  const totalBathrooms = units.reduce((total, unit) => total + (unit.bathrooms || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Units</h1>
            <p className="text-gray-600">
              View and manage all units for this property. {units.length} unit{units.length !== 1 ? "s" : ""} found.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600">Occupied</div>
              <div className="text-2xl font-bold text-navy-700">{occupiedUnits}</div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600">Vacant</div>
              <div className="text-2xl font-bold text-blue-600">{units.length - occupiedUnits}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Unit Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Specifications</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rent</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Appliances</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {units.map((unit) => {
                const hasDetails = unit.unitName || unit.bedrooms || unit.bathrooms || unit.floorNumber || unit.rentAmount;
                const applianceCount = unit.appliances?.length || 0;

                return (
                  <tr key={unit.unitNumber} className="hover:bg-gray-50 transition-colors">
                    {/* Unit Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Home className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Unit {unit.unitNumber}
                          </div>
                          {unit.unitName && (
                            <div className="text-sm text-gray-500">{unit.unitName}</div>
                          )}
                          {unit.floorNumber && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Building className="w-3 h-3" />
                              Floor {unit.floorNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Specifications */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {unit.bedrooms || 0}
                          </span>
                          <span className="text-xs text-gray-500">Beds</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bath className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {unit.bathrooms || 0}
                          </span>
                          <span className="text-xs text-gray-500">Baths</span>
                        </div>
                      </div>
                    </td>

                    {/* Rent */}
                    <td className="px-6 py-4">
                      {unit.rentAmount ? (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-navy-700" />
                          <span className="font-semibold text-gray-900">
                            KSh {unit.rentAmount.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not set</span>
                      )}
                    </td>

                    {/* Appliances */}
                    <td className="px-6 py-4">
                      {applianceCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{applianceCount} appliance{applianceCount !== 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">None</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          unit.isOccupied ? 'bg-navy-500 animate-pulse' : 'bg-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          unit.isOccupied ? 'text-green-800' : 'text-gray-600'
                        }`}>
                          {unit.isOccupied ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/property-manager/view-own-property/${propertyId}/units/${unit.unitNumber}/edit`}
                          className={`px-4 py-2 rounded-lg font-medium text-sm text-center transition-colors ${
                            hasDetails
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {hasDetails ? 'Edit Details' : 'Add Details'}
                        </Link>
                        
                        <Link
                          href={`/property-manager/view-own-property/${propertyId}/units/${unit.unitNumber}/list`}
                          className="px-4 py-2 rounded-lg font-medium text-sm text-center bg-navy-700 hover:bg-navy-800 text-white transition-colors"
                        >
                          List Unit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{units.length}</div>
              <div className="text-sm text-gray-600">Total Units</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-navy-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-700">{occupiedUnits}</div>
              <div className="text-sm text-gray-600">Occupied Units</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Bed className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalRooms}</div>
              <div className="text-sm text-gray-600">Total Rooms</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Bath className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalBathrooms}</div>
              <div className="text-sm text-gray-600">Total Bathrooms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}