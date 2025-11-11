"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Download, Phone, Mail, Home, Calendar, DollarSign, User } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeases() {
      try {
        const res = await fetch("/api/lease");
        if (!res.ok) {
          throw new Error("Failed to fetch leases");
        }
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

  const filteredLeases = leases.filter((lease) => {
    const matchesSearch = 
      lease.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.tenant?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.unit?.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || lease.leaseStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leases.length,
    signed: leases.filter(l => l.leaseStatus === "SIGNED").length,
    pending: leases.filter(l => l.leaseStatus === "PENDING").length,
    draft: leases.filter(l => l.leaseStatus === "DRAFT").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SIGNED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isLeaseExpiringSoon = (endDate: string) => {
    try {
      const daysUntilExpiry = Math.ceil(
        (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    } catch {
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
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
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tenant Management</h1>
              <p className="text-slate-600 mt-1">Manage and monitor all your tenants and leases</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Tenants</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Active Leases</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.signed}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Filter className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Drafts</p>
                <p className="text-3xl font-bold text-slate-600 mt-1">{stats.draft}</p>
              </div>
              <div className="bg-slate-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by tenant name, email, property, or unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="flex gap-2">
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

              <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants List */}
        {!filteredLeases.length ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No tenants found matching your criteria.</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
            {filteredLeases.map((lease) => (
              <div
                key={lease.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate">
                        {lease.tenant?.name || lease.tenant?.email || "Unnamed Tenant"}
                      </h3>
                      {lease.tenant?.name && (
                        <p className="text-blue-100 text-sm mt-1 truncate">{lease.tenant?.email || "No email"}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ml-2 ${getStatusColor(lease.leaseStatus)}`}>
                      {lease.leaseStatus}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  {/* Property & Unit */}
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="bg-slate-100 p-2 rounded-lg flex-shrink-0">
                      <Home className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-500">Property & Unit</p>
                      <p className="font-semibold truncate">{lease.property?.name || "N/A"} - {lease.unit?.unitNumber || "N/A"}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{lease.tenant?.phone || "No phone"}</span>
                    </div>
                  </div>

                  {/* Lease Period */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Lease Period</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                    </div>
                    {isLeaseExpiringSoon(lease.endDate) && (
                      <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        Expiring Soon
                      </span>
                    )}
                  </div>

                  {/* Financial Info */}
                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Monthly Rent</span>
                      <span className="font-bold text-slate-900">KES {lease.rentAmount?.toLocaleString() || 0}</span>
                    </div>
                    {lease.securityDeposit && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm">Security Deposit</span>
                        <span className="font-semibold text-slate-700">KES {lease.securityDeposit.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}