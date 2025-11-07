"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  leaseStatus: string;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  tenant?: {
    email: string;
  };
  property?: {
    name: string;
  };
  unit?: {
    unitNumber: string;
  };
}

export default function LeaseListPage() {
  const router = useRouter();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
            async function fetchLeases() {
        try {
            const res = await fetch("/api/lease", {
            method: "GET",
            cache: "no-store",
            credentials: "include", // ✅ Makes sure token cookie is sent
            });

            const data = await res.json();

            if (res.ok) {
            setLeases(data);
            } else {
            setError(data.error || "Failed to fetch leases");
            }
        } catch (err) {
            console.error("Failed to fetch leases:", err);
            setError("An error occurred while loading leases");
        } finally {
            setLoading(false);
        }
        }


    fetchLeases();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SIGNED":
        return "bg-green-100 text-green-800";
      case "ACTIVE":
        return "bg-blue-100 text-blue-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSignatureStatus = (lease: Lease) => {
    if (lease.landlordSignedAt && lease.tenantSignedAt) {
      return { icon: "✓✓", text: "Fully Signed", color: "text-green-600" };
    } else if (lease.landlordSignedAt || lease.tenantSignedAt) {
      return { icon: "✓", text: "Partially Signed", color: "text-yellow-600" };
    } else {
      return { icon: "○", text: "Not Signed", color: "text-gray-400" };
    }
  };

  const filteredLeases = leases.filter((lease) => {
    if (filter === "ALL") return true;
    return lease.leaseStatus === filter;
  });

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">All Leases</h1>
        <p className="text-gray-600">Manage and view all lease agreements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Total Leases</p>
          <p className="text-2xl font-bold">{leases.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Signed</p>
          <p className="text-2xl font-bold text-green-600">
            {leases.filter((l) => l.leaseStatus === "SIGNED").length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Draft</p>
          <p className="text-2xl font-bold text-yellow-600">
            {leases.filter((l) => l.leaseStatus === "DRAFT").length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-blue-600">
            {leases.filter((l) => l.leaseStatus === "ACTIVE").length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {["ALL", "DRAFT", "SIGNED", "ACTIVE", "EXPIRED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status}
              {status !== "ALL" && (
                <span className="ml-2 text-xs">
                  ({leases.filter((l) => l.leaseStatus === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Leases List */}
      {filteredLeases.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Leases Found</h3>
          <p className="text-gray-500 mb-4">
            {filter === "ALL"
              ? "You haven't created any leases yet."
              : `No leases with status "${filter}".`}
          </p>
          <button
            onClick={() => router.push("/property-manager/content/lease/create")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Lease
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeases.map((lease) => {
            const signatureStatus = getSignatureStatus(lease);
            return (
              <div
                key={lease.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Section - Property Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl font-bold flex-shrink-0">
                        {lease.unit?.unitNumber || "?"}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {lease.property?.name || "Unknown Property"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Unit {lease.unit?.unitNumber || "N/A"} • {lease.tenant?.email || "No tenant"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Start Date</p>
                        <p className="font-semibold">
                          {new Date(lease.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">End Date</p>
                        <p className="font-semibold">
                          {new Date(lease.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Monthly Rent</p>
                        <p className="font-semibold text-blue-600">
                          ${lease.rentAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Signatures</p>
                        <p className={`font-semibold ${signatureStatus.color}`}>
                          {signatureStatus.icon} {signatureStatus.text}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        lease.leaseStatus
                      )}`}
                    >
                      {lease.leaseStatus}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/property-manager/content/lease/${lease.id}`)}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/property-manager/content/lease/${lease.id}/sign`)
                        }
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Sign
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}