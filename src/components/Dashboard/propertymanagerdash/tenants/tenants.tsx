"use client";

import { useEffect, useState } from "react";

interface Tenant {
  id: string;
  name?: string;
  email: string;
  phone?: string | null;
}

interface Property {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  unitNumber: string;
}

interface Lease {
  id: string;
  tenant?: Tenant;
  property?: Property;
  unit?: Unit;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit?: number | null;
  leaseStatus: "DRAFT" | "SIGNED" | "PENDING" | string;
}

export default function TenantLeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeases() {
      try {
        const res = await fetch("/api/lease");
        const data = await res.json();
        if (res.ok) {
          setLeases(data);
        } else {
          console.error("Failed to fetch leases:", data.error);
        }
      } catch (error) {
        console.error("Error fetching leases:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leases...</p>
        </div>
      </div>
    );
  }

  if (!leases.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-xl">No tenants or leases found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {leases.map((lease) => (
        <div
          key={lease.id}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {lease.tenant?.name || lease.tenant?.email}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                lease.leaseStatus === "SIGNED"
                  ? "bg-green-100 text-green-800"
                  : lease.leaseStatus === "DRAFT"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {lease.leaseStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div>
              <p>
                <strong>Email:</strong> {lease.tenant?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {lease.tenant?.phone || "N/A"}
              </p>
              <p>
                <strong>Property:</strong> {lease.property?.name || "N/A"}
              </p>
            </div>

            <div>
              <p>
                <strong>Unit:</strong> {lease.unit?.unitNumber || "N/A"}
              </p>
              <p>
                <strong>Lease Period:</strong>{" "}
                {new Date(lease.startDate).toLocaleDateString()} -{" "}
                {new Date(lease.endDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Rent:</strong> KES {lease.rentAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {lease.securityDeposit && (
            <p className="mt-3 text-gray-700">
              <strong>Security Deposit:</strong> KES{" "}
              {lease.securityDeposit.toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
