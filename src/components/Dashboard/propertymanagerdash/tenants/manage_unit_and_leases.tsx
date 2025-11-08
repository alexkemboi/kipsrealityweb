"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Tenant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  tenant?: Tenant | null;
}

interface Unit {
  id: string;
  unitNumber: string;
  bedrooms?: number;
  bathrooms?: number;
  leases: Lease[];
}

export default function ManageUnitsAndLeasesPage() {
  const { id: propertyId } = useParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUnits() {
      console.log("Fetching units for propertyId:", propertyId);
      try {
        const res = await fetch(`/api/propertymanager/${propertyId}/units-with-leases`);
        console.log("Raw response:", res);

        const data = await res.json();
        console.log("Fetched data:", data);

        if (!res.ok) throw new Error(data.error || "Failed to fetch units");

        setUnits(data);
      } catch (err: any) {
        console.error("Error fetching units:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (propertyId) fetchUnits();
    else console.warn("propertyId is undefined");
  }, [propertyId]);

  if (loading) return <p className="p-10 text-center">Loading units...</p>;
  if (error) return <p className="p-10 text-center text-red-600">{error}</p>;

  console.log("Units state:", units);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Units & Leases</h1>

      {units.length === 0 && <p>No units found for this property.</p>}

      {units.map((unit) => (
        <div key={unit.id} className="mb-6 border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">
            Unit {unit.unitNumber} ({unit.bedrooms ?? "-"} bed / {unit.bathrooms ?? "-"} bath)
          </h2>

          {unit.leases.length === 0 ? (
            <p className="text-gray-500">No leases for this unit.</p>
          ) : (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Tenant</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Phone</th>
                  <th className="border p-2 text-left">Lease Term</th>
                  <th className="border p-2 text-left">Rent</th>
                </tr>
              </thead>
              <tbody>
                {unit.leases.map((lease) => (
                  <tr key={lease.id}>
                    <td className="border p-2">{lease.tenant?.fullName || "Unknown"}</td>
                    <td className="border p-2">{lease.tenant?.email || "-"}</td>
                    <td className="border p-2">{lease.tenant?.phone || "-"}</td>
                    <td className="border p-2">
                      {new Date(lease.startDate).toLocaleDateString()} →{" "}
                      {new Date(lease.endDate).toLocaleDateString()}
                    </td>
                    <td className="border p-2">${lease.rentAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
