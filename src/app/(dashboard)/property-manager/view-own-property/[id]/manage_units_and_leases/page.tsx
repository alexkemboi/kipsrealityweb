//app/dashboard/property-manager/view-own-property/id/manage_units_and_leases/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  PenTool,
  Building2
} from "lucide-react";

interface Tenant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

interface Application {
  fullName: string;
  email: string;
  phone: string;
}

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  leaseStatus: string;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  tenant?: Tenant | null;
  application?: Application | null;
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
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await fetch(`/api/propertymanager/${propertyId}/units-with-leases`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch units");

        setUnits(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (propertyId) fetchUnits();
  }, [propertyId]);

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
      return { 
        icon: <CheckCircle2 className="w-4 h-4" />, 
        text: "Fully Signed", 
        color: "text-green-600"
      };
    } else if (lease.landlordSignedAt || lease.tenantSignedAt) {
      return { 
        icon: <Clock className="w-4 h-4" />, 
        text: "Partial", 
        color: "text-yellow-600"
      };
    } else {
      return { 
        icon: <AlertCircle className="w-4 h-4" />, 
        text: "Unsigned", 
        color: "text-gray-400"
      };
    }
  };

  const isLeaseActive = (lease: Lease) => {
    const now = new Date();
    const start = new Date(lease.startDate);
    const end = new Date(lease.endDate);
    return now >= start && now <= end;
  };

  const allLeases = units.flatMap(unit => 
    unit.leases.map(lease => ({ ...lease, unit }))
  );

  const filteredLeases = allLeases.filter(lease => {
    if (filter === "ALL") return true;
    return lease.leaseStatus === filter;
  });

  const stats = {
    total: allLeases.length,
    signed: allLeases.filter(l => l.leaseStatus === "SIGNED").length,
    active: allLeases.filter(l => l.leaseStatus === "ACTIVE").length,
    draft: allLeases.filter(l => l.leaseStatus === "DRAFT").length,
    expired: allLeases.filter(l => l.leaseStatus === "EXPIRED").length,
  };

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
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading leases</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            Property Leases
          </h1>
          <p className="text-gray-600 mt-2">Manage all lease agreements for this property</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-1">Total Leases</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-5 border border-green-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Signed</p>
            <p className="text-3xl font-bold text-green-600">{stats.signed}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-5 border border-blue-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Active</p>
            <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-5 border border-yellow-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Draft</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-5 border border-gray-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Expired</p>
            <p className="text-3xl font-bold text-gray-600">{stats.expired}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 border border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {["ALL", "DRAFT", "SIGNED", "ACTIVE", "EXPIRED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
                {status !== "ALL" && (
                  <span className="ml-2 text-xs opacity-75">
                    ({allLeases.filter((l) => l.leaseStatus === status).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Leases Table */}
        {filteredLeases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Leases Found</h3>
            <p className="text-gray-500 mb-4">
              {filter === "ALL"
                ? "No leases have been created for this property yet."
                : `No leases with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lease Term
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rent
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Signatures
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeases.map((lease) => {
                    const signatureStatus = getSignatureStatus(lease);
                    const active = isLeaseActive(lease);
                    
                    return (
                      <tr key={lease.id} className="hover:bg-gray-50 transition-colors">
                        {/* Unit */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                              {lease.unit?.unitNumber || "?"}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Unit {lease.unit?.unitNumber || "N/A"}
                              </div>
                              {active && (
                                <span className="text-xs text-emerald-600 font-medium">
                                  Active Now
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Tenant */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {lease.tenant?.fullName || lease.application?.fullName || "—"}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {lease.tenant?.email || lease.application?.email || "—"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {lease.tenant?.phone || lease.application?.phone || ""}
                          </div>
                        </td>

                        {/* Lease Term */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(lease.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {new Date(lease.endDate).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Rent */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-blue-600">
                            ${lease.rentAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">per month</div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lease.leaseStatus)}`}>
                            {lease.leaseStatus}
                          </span>
                        </td>

                        {/* Signatures */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={signatureStatus.color}>
                              {signatureStatus.icon}
                            </span>
                            <span className={`text-xs font-medium ${signatureStatus.color}`}>
                              {signatureStatus.text}
                            </span>
                          </div>
                          {(lease.landlordSignedAt || lease.tenantSignedAt) && (
                            <div className="mt-1 space-y-0.5">
                              {lease.landlordSignedAt && (
                                <div className="text-xs text-gray-500">
                                  L: {new Date(lease.landlordSignedAt).toLocaleDateString()}
                                </div>
                              )}
                              {lease.tenantSignedAt && (
                                <div className="text-xs text-gray-500">
                                  T: {new Date(lease.tenantSignedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/property-manager/content/lease/${lease.id}`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/property-manager/content/lease/${lease.id}/sign`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Sign Lease"
                            >
                              <PenTool className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}