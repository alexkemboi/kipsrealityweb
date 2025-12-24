"use client";

import { Building, Bed, Bath, DollarSign, Users, Home, Utensils } from "lucide-react";
import Link from "next/link";

interface Unit {
  unitNumber: string;
  unitName?: string;
  floorNumber?: number;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount?: number;
  appliances?: any[];
  isOccupied: boolean;
}

interface UnitsTableProps {
  propertyId: string;
  units: Unit[];
  inModal?: boolean; // optional, if rendered inside a modal
}

export default function UnitsTable({ propertyId, units, inModal = false }: UnitsTableProps) {
  const occupiedUnits = units.filter(unit => unit.isOccupied).length;
  const totalRooms = units.reduce((total, unit) => total + (unit.bedrooms || 0), 0);
  const totalBathrooms = units.reduce((total, unit) => total + (unit.bathrooms || 0), 0);

  if (units.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Home className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No Units Found</h3>
          <p className="text-gray-600 text-sm">
            This property doesn't have any units yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={inModal ? "max-h-[70vh] overflow-y-auto" : ""}>
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Unit Details</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Specifications</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Rent</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Appliances</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map(unit => {
            const applianceCount = unit.appliances?.length || 0;
            const hasDetails = unit.unitName || unit.bedrooms || unit.bathrooms || unit.floorNumber || unit.rentAmount;

            return (
              <tr key={unit.unitNumber} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 flex items-center justify-center rounded-lg">
                      <Home className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Unit {unit.unitNumber}</div>
                      {unit.unitName && <div className="text-sm text-gray-500">{unit.unitName}</div>}
                      {unit.floorNumber && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Building className="w-3 h-3" /> Floor {unit.floorNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 flex gap-3">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-gray-400" />
                    {unit.bedrooms || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-gray-400" />
                    {unit.bathrooms || 0}
                  </div>
                </td>
                <td className="px-4 py-2">
                  {unit.rentAmount ? `KSh ${unit.rentAmount.toLocaleString()}` : "Not set"}
                </td>
                <td className="px-4 py-2">{applianceCount || "None"}</td>
                <td className="px-4 py-2">
                  <span className={`${unit.isOccupied ? "text-green-500" : "text-gray-500"}`}>
                    {unit.isOccupied ? "Occupied" : "Vacant"}
                  </span>
                </td>
                <td className="px-4 py-2 flex flex-col gap-1">
                  <Link
                    href={`/property-manager/view-own-property/${propertyId}/units/${unit.unitNumber}/edit`}
                    className={`px-2 py-1 text-sm rounded-lg text-white ${
                      hasDetails ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {hasDetails ? "Edit Details" : "Add Details"}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer summary if not in modal */}
      {!inModal && (
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm text-gray-700">
          <div>Total Units: {units.length}</div>
          <div>Occupied Units: {occupiedUnits}</div>
          <div>Total Rooms: {totalRooms}</div>
          <div>Total Bathrooms: {totalBathrooms}</div>
        </div>
      )}
    </div>
  );
}
