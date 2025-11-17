"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Download, Phone, Calendar, Home, DollarSign, User } from "lucide-react";

interface Tenant {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
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

interface FinancialSummary {
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
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
  financialSummary?: FinancialSummary;
}

export default function TenantLeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeases() {
      try {
        const res = await fetch("/api/lease");
        if (!res.ok) throw new Error("Failed to fetch leases");
        const data = await res.json();
        setLeases(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching leases:", err);
        setError("Failed to load tenant data. Please try again.");
        setLeases([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLeases();
  }, []);
   // Full name helper
  const getTenantName = (tenant?: Tenant) => {
    if (!tenant) return "Unnamed Tenant";
    const full = [tenant.firstName, tenant.lastName].filter(Boolean).join(" ");
    return full || tenant.email || "Unnamed Tenant";
  };

  const filteredLeases = leases.filter((lease) => {
    const name = getTenantName(lease.tenant).toLowerCase();
    const email = lease.tenant?.email?.toLowerCase() || "";
    const property = lease.property?.name?.toLowerCase() || "";
    const unit = lease.unit?.unitNumber?.toLowerCase() || "";

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      property.includes(searchTerm.toLowerCase()) ||
      unit.includes(searchTerm.toLowerCase())



    const matchesStatus = statusFilter === "ALL" || lease.leaseStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLeases.length / pageSize);
  const paginatedLeases = filteredLeases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const stats = {
    total: leases.length,
    signed: leases.filter(l => l.leaseStatus === "SIGNED").length,
    pending: leases.filter(l => l.leaseStatus === "PENDING").length,
    draft: leases.filter(l => l.leaseStatus === "DRAFT").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SIGNED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "DRAFT": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isLeaseExpiringSoon = (endDate: string) => {
    try {
      const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000*60*60*24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    } catch { return false; }
  };

  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString(); }
    catch { return "Invalid date"; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading tenant data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header & Export */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tenant Management</h1>
            <p className="text-slate-600 mt-1">Manage and monitor all your tenants and leases</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-between items-center">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Tenants</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg"><User className="w-6 h-6 text-blue-600" /></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-between items-center">
            <div>
              <p className="text-slate-600 text-sm font-medium">Active Leases</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.signed}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg"><Calendar className="w-6 h-6 text-emerald-600" /></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-between items-center">
            <div>
              <p className="text-slate-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg"><Filter className="w-6 h-6 text-amber-600" /></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-between items-center">
            <div>
              <p className="text-slate-600 text-sm font-medium">Drafts</p>
              <p className="text-3xl font-bold text-slate-600 mt-1">{stats.draft}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-slate-600" /></div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by tenant, email, property, or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="SIGNED">Signed</option>
            <option value="PENDING">Pending</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {/* Tenants Table */}
        {filteredLeases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No tenants found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-700">Tenant</th>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-700">Property & Unit</th>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-700">Lease Period</th>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-700">Rent / Deposit</th>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-700">Financial Summary</th>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
             <tbody className="divide-y divide-slate-100">
  {paginatedLeases.map((lease) => {
    const tenant = lease.tenant;
              const tenantName = getTenantName(tenant);
    const tenantEmail = tenant?.email || "No email";

    return (
      <tr key={lease.id} className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4">
                    <p className="font-medium">{tenantName}</p>
          <p className="text-sm text-slate-500">{tenantEmail}</p>
        </td>

        <td className="px-6 py-4">
          {lease.property?.name || "N/A"} - {lease.unit?.unitNumber || "N/A"}
        </td>

        <td className="px-6 py-4">
          {tenant?.phone || "No phone"}
        </td>

        <td className="px-6 py-4">
          {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
          {isLeaseExpiringSoon(lease.endDate) && (
            <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
              Expiring Soon
            </span>
          )}
        </td>

        <td className="px-6 py-4">
          <p>KES {lease.rentAmount?.toLocaleString()}</p>
          {lease.securityDeposit && (
            <p className="text-sm text-slate-600">
              Deposit: KES {lease.securityDeposit.toLocaleString()}
            </p>
          )}
        </td>

        <td className="px-6 py-4 space-y-1">
          {lease.financialSummary && (
            <>
              <p className="text-sm">Invoiced: KES {lease.financialSummary.totalInvoiced.toLocaleString()}</p>
              <p className="text-sm text-emerald-700">Paid: KES {lease.financialSummary.totalPaid.toLocaleString()}</p>
              <p className={`text-sm font-semibold ${lease.financialSummary.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                Balance: KES {lease.financialSummary.balance.toLocaleString()}
              </p>
            </>
          )}
        </td>

        <td className="px-6 py-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lease.leaseStatus)}`}>
            {lease.leaseStatus}
          </span>
        </td>

        <td className="px-6 py-4 flex gap-2">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            onClick={() => {
              if (tenant?.id) {
                router.push(`/property-manager/content/tenants/${tenant.id}`);
              }
            }}
            disabled={!tenant?.id}
          >
            View
          </button>
          <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 text-sm">
            Contact
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
                <p className="text-sm text-slate-600">
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredLeases.length)} of {filteredLeases.length} tenants
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white border rounded-lg disabled:opacity-40 hover:bg-slate-100"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg border text-sm ${currentPage === pageNum ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-slate-100"}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white border rounded-lg disabled:opacity-40 hover:bg-slate-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
