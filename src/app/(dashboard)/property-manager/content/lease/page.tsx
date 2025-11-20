// app/dashboard/property-manager/leases/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Bell,
  Download,
  Eye,
  Edit,
  RefreshCw,
  FileEdit,
  PlayCircle,
  StopCircle,
  CheckSquare,
  FolderOpen,
  MoreVertical,
} from "lucide-react";

interface LeaseWithDetails {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  leaseStatus: string;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  hasRenewalOption: boolean;
  nextEscalationDate: string | null;
  complianceStatus: string;
  documentVersion: number;
  tenant?: { fullName: string; email: string };
  application?: { fullName: string; email: string };
  property: { name: string };
  unit: { unitNumber: string };
  renewalHistory: any[];
  escalationHistory: any[];
  notifications: any[];
  amendments: any[];
  documents: any[];
}

export default function EnhancedLeaseManagementDashboard() {
  const router = useRouter();
  const [leases, setLeases] = useState<LeaseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedLease, setSelectedLease] = useState<string | null>(null);

  useEffect(() => {
    fetchLeases();
  }, []);

  async function fetchLeases() {
    try {
      const res = await fetch("/api/lease");
      const data = await res.json();
      if (res.ok) {
        setLeases(data);
      }
    } catch (error) {
      console.error("Failed to fetch leases:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeaseAction(leaseId: string, action: string) {
    const confirmations: { [key: string]: string } = {
      APPROVE: "Are you sure you want to approve this lease?",
      ACTIVATE: "This will activate the lease. Continue?",
      TERMINATE: "Are you sure you want to terminate this lease?",
    };

    if (!confirm(confirmations[action])) return;

    setActionLoading(leaseId);
    try {
      const res = await fetch("/api/lease/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId, action }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Lease ${action.toLowerCase()}d successfully`);
        fetchLeases(); // Refresh data
      } else {
        alert(data.error || `Failed to ${action.toLowerCase()} lease`);
      }
    } catch (error) {
      console.error("Action error:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  }

  const stats = {
    total: leases.length,
    active: leases.filter((l) => l.leaseStatus === "ACTIVE").length,
    expiring: leases.filter((l) => l.leaseStatus === "EXPIRING_SOON").length,
    draft: leases.filter((l) => l.leaseStatus === "DRAFT").length,
    pendingApproval: leases.filter((l) => l.leaseStatus === "PENDING_APPROVAL")
      .length,
    compliance: leases.filter((l) => l.complianceStatus === "NON_COMPLIANT")
      .length,
    renewals: leases.filter((l) => l.hasRenewalOption && isExpiringSoon(l))
      .length,
    escalations: leases.filter(
      (l) => l.nextEscalationDate && isEscalationSoon(l)
    ).length,
  };

  function isExpiringSoon(lease: LeaseWithDetails) {
    const daysUntilExpiry = Math.ceil(
      (new Date(lease.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 60 && daysUntilExpiry > 0;
  }

  function isEscalationSoon(lease: LeaseWithDetails) {
    if (!lease.nextEscalationDate) return false;
    const daysUntilEscalation = Math.ceil(
      (new Date(lease.nextEscalationDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysUntilEscalation <= 30 && daysUntilEscalation > 0;
  }

  const filteredLeases = leases.filter((lease) => {
    const matchesFilter = filter === "ALL" || lease.leaseStatus === filter;
    const matchesSearch =
      searchTerm === "" ||
      lease.tenant?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.application?.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      lease.unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.property.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-300";
      case "EXPIRING_SOON":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "PENDING_APPROVAL":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "SIGNED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "EXPIRED":
        return "bg-red-100 text-red-800 border-red-300";
      case "TERMINATED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Lease Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all lease agreements, renewals, amendments, and compliance
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Expiring</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.expiring}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <Edit className="w-6 h-6 text-gray-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pendingApproval}
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Compliance</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.compliance}
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Renewals</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.renewals}
                </p>
              </div>
              <RefreshCw className="w-6 h-6 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Escalations</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.escalations}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by tenant, property, or unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                "ALL",
                "DRAFT",
                "PENDING_APPROVAL",
                "APPROVED",
                "SIGNED",
                "ACTIVE",
                "EXPIRING_SOON",
                "EXPIRED",
                "TERMINATED",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leases Table */}
        {filteredLeases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Leases Found
            </h3>
            <p className="text-gray-500">
              {filter === "ALL"
                ? "No leases match your search criteria."
                : `No leases with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Property / Unit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Tenant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Lease Term
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Rent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Quick Actions
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Alerts
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeases.map((lease) => {
                    const daysToExpiry = Math.ceil(
                      (new Date(lease.endDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    const daysToEscalation = lease.nextEscalationDate
                      ? Math.ceil(
                          (new Date(lease.nextEscalationDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;

                    return (
                      <tr
                        key={lease.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Property/Unit */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-sm text-gray-900">
                            {lease.property.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Unit {lease.unit.unitNumber}
                          </div>
                          {lease.documentVersion > 1 && (
                            <div className="text-xs text-blue-600 mt-1">
                              v{lease.documentVersion}
                            </div>
                          )}
                        </td>

                        {/* Tenant */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm text-gray-900">
                            {lease.tenant?.fullName || lease.application?.fullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {lease.tenant?.email || lease.application?.email}
                          </div>
                        </td>

                        {/* Lease Term */}
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-900">
                            {new Date(lease.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            to {new Date(lease.endDate).toLocaleDateString()}
                          </div>
                          {daysToExpiry > 0 && daysToExpiry <= 60 && (
                            <div className="text-xs text-orange-600 font-medium mt-1">
                              {daysToExpiry} days left
                            </div>
                          )}
                        </td>

                        {/* Rent */}
                        <td className="px-4 py-3">
                          <div className="text-base font-semibold text-blue-600">
                            ${lease.rentAmount.toLocaleString()}
                          </div>
                          {daysToEscalation && daysToEscalation <= 30 && (
                            <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                              <TrendingUp className="w-3 h-3" />
                              {daysToEscalation}d to escalation
                            </div>
                          )}
                          {lease.escalationHistory?.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {lease.escalationHistory.length} escalations
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              lease.leaseStatus
                            )}`}
                          >
                            {lease.leaseStatus.replace(/_/g, " ")}
                          </span>
                          {lease.amendments?.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {lease.amendments.length} amendments
                            </div>
                          )}
                        </td>

                        {/* Quick Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* View Details */}
                            <button
                              onClick={() =>
                                router.push(
                                  `/property-manager/content/lease/${lease.id}`
                                )
                              }
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Amendments */}
                            <button
                              onClick={() =>
                                router.push(
                                  `/property-manager/content/lease/${lease.id}/amendments`
                                )
                              }
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                              title="Manage Amendments"
                            >
                              <FileEdit className="w-4 h-4" />
                            </button>

                            {/* Documents */}
                            <button
                              onClick={() =>
                                router.push(
                                  `/property-manager/content/lease/${lease.id}/documents`
                                )
                              }
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              title="Documents"
                            >
                              <FolderOpen className="w-4 h-4" />
                            </button>

                            {/* Renew (if eligible) */}
                            {lease.hasRenewalOption && daysToExpiry <= 60 && (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/property-manager/content/lease/${lease.id}/renew`
                                  )
                                }
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Renew Lease"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}

                            {/* Workflow Actions Dropdown */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setSelectedLease(
                                    selectedLease === lease.id ? null : lease.id
                                  )
                                }
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="More Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {selectedLease === lease.id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    {lease.leaseStatus === "DRAFT" && (
                                      <button
                                        onClick={() => {
                                          handleLeaseAction(lease.id, "APPROVE");
                                          setSelectedLease(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        disabled={actionLoading === lease.id}
                                      >
                                        <CheckSquare className="w-4 h-4" />
                                        Approve Lease
                                      </button>
                                    )}

                                    {lease.leaseStatus === "SIGNED" && (
                                      <button
                                        onClick={() => {
                                          handleLeaseAction(lease.id, "ACTIVATE");
                                          setSelectedLease(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                        disabled={actionLoading === lease.id}
                                      >
                                        <PlayCircle className="w-4 h-4" />
                                        Activate Lease
                                      </button>
                                    )}

                                    {lease.leaseStatus === "ACTIVE" && (
                                      <button
                                        onClick={() => {
                                          handleLeaseAction(
                                            lease.id,
                                            "TERMINATE"
                                          );
                                          setSelectedLease(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                        disabled={actionLoading === lease.id}
                                      >
                                        <StopCircle className="w-4 h-4" />
                                        Terminate Lease
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        router.push(
                                          `/property-manager/content/lease/${lease.id}/escalate`
                                        );
                                        setSelectedLease(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <TrendingUp className="w-4 h-4" />
                                      Apply Escalation
                                    </button>

                                    <button
                                      onClick={() => {
                                        // Download functionality
                                        setSelectedLease(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download All Docs
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Alerts */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {lease.complianceStatus === "NON_COMPLIANT" && (
                              <span className="flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                Compliance issue
                              </span>
                            )}

                            {lease.notifications?.length > 0 && (
                              <span className="flex items-center gap-1 text-xs text-orange-600">
                                <Bell className="w-3 h-3" />
                                {lease.notifications.length} notifications
                              </span>
                            )}

                            {lease.hasRenewalOption && daysToExpiry <= 60 && (
                              <span className="flex items-center gap-1 text-xs text-purple-600">
                                <Calendar className="w-3 h-3" />
                                Renewal eligible
                              </span>
                            )}

                            {daysToEscalation && daysToEscalation <= 30 && (
                              <span className="flex items-center gap-1 text-xs text-indigo-600">
                                <TrendingUp className="w-3 h-3" />
                                Escalation pending
                              </span>
                            )}

                            {lease.amendments?.some(
                              (a: any) => a.status === "PENDING"
                            ) && (
                              <span className="flex items-center gap-1 text-xs text-blue-600">
                                <FileEdit className="w-3 h-3" />
                                Amendment pending
                              </span>
                            )}
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

      {/* Close dropdown when clicking outside */}
      {selectedLease && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setSelectedLease(null)}
        />
      )}
    </div>
  );
}