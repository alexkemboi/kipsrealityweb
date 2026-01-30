"use client";

import { useEffect, useState } from "react";
import {
  User, Home, FileText, Mail, DollarSign, Calendar,
  Phone, Search, Eye, Download, Check, X,
  AlertCircle, Plus, ExternalLink, TrendingUp,
  Clock, CheckCircle, AlertTriangle,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import router from "next/router";
import { TenantApplication } from "../../type";

// Types
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
  city?: string;
  address?: string;
}

interface Unit {
  id: string;
  unitNumber: string;
  unitName?: string;
  rentAmount?: number;
}

interface FinancialSummary {
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  lastPaymentDate?: string;
}

interface Lease {
  invoice: any;
  id: string;
  tenant?: Tenant;
  property?: Property;
  unit?: Unit;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit?: number | null;
  leaseStatus: string;
  financialSummary?: FinancialSummary;
  application?: {
    id: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  property?: Property;
  unit?: Unit;
  moveInDate: string;
  createdAt: string;
  employerName?: string;
  jobTitle?: string;
  monthlyIncome?: number;
  address?: string;
  dob?: string;
}

interface Invite {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  accepted: boolean;
  createdAt: string;
  leaseId: string;
  token: string;
}

export default function EnhancedTenantDashboard() {
  const [activeTab, setActiveTab] = useState<"tenants" | "applications" | "invites">("tenants");
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Data states
  const [leases, setLeases] = useState<Lease[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    firstName: selectedTenant?.firstName || "",
    lastName: selectedTenant?.lastName || "",
    email: selectedTenant?.email || "",
    phone: selectedTenant?.phone || "",
  });

  const [isSaving, setIsSaving] = useState(false);




  // Fetch all data
  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      try {
        const [leasesRes, appsRes, invitesRes] = await Promise.all([
          fetch("/api/lease"),
          fetch("/api/tenant-application"),
          fetch("/api/auth/invites/tenant")
        ]);

        const [leasesData, appsData, invitesData] = await Promise.all([
          leasesRes.json(),
          appsRes.json(),
          invitesRes.json()
        ]);

        setLeases(Array.isArray(leasesData) ? leasesData : []);
        setApplications(Array.isArray(appsData) ? appsData : []);
        setInvites(invitesData.invites || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // Prefill form when lease is selected for invite
  useEffect(() => {
    if (selectedLeaseId) {
      const lease = leases.find(l => l.id === selectedLeaseId);

      if (lease?.application) {
        const fullName = lease.application.fullName || "";
        const nameParts = fullName.trim().split(/\s+/);
        const fName = nameParts[0] || "";
        const lName = nameParts.slice(1).join(" ") || "";

        setInviteEmail(lease.application.email || "");
        setInviteFirstName(fName);
        setInviteLastName(lName);
        setInvitePhone(lease.application.phone || "");
      } else {
        setInviteEmail("");
        setInviteFirstName("");
        setInviteLastName("");
        setInvitePhone("");
      }
    } else {
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInvitePhone("");
    }
  }, [selectedLeaseId, leases]);

  // Full name helper
  const getTenantName = (tenant?: Tenant) => {
    if (!tenant) return "Unnamed Tenant";
    const full = [tenant.firstName, tenant.lastName].filter(Boolean).join(" ");
    return full || tenant.email || "Unnamed Tenant";
  };
  // Filter functions
  const filteredLeases = leases.filter((lease) => {
    const name = getTenantName(lease.tenant).toLowerCase();
    const email = lease.tenant?.email?.toLowerCase() || "";
    const property = lease.property?.name?.toLowerCase() || "";
    const unit = lease.unit?.unitNumber?.toLowerCase() || "";

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      property.includes(searchTerm.toLowerCase()) ||
      unit.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || lease.leaseStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });



  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const openEditModal = (tenant?: Tenant) => {
    if (!tenant) return;

    setSelectedTenant(tenant);

    setFormData({
      firstName: tenant.firstName || "",
      lastName: tenant.lastName || "",
      email: tenant.email || "",
      phone: tenant.phone || "",
    });

    setIsEditModalOpen(true);
  };



  // Submit edited tenant details
  const handleSave = async () => {
    if (!selectedTenant) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/tenants/${selectedTenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update tenant");

      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update tenant");
    } finally {
      setIsSaving(false);
    }
  };


  // Handle Approve
  async function handleApprove(appId: string) {
    try {
      const res = await fetch(`/api/tenant-application/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: "Approved" } : app))
        );
        setShowModal(false);
        alert("Application approved! You can now proceed to lease signing.");
      }
    } catch (err) {
      console.error("Error approving application:", err);
      alert("Failed to approve application");
    }
  }

  // Handle Reject
  async function handleReject(appId: string) {
    try {
      const res = await fetch(`/api/tenant-application/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: "Rejected" } : app))
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error rejecting application:", err);
      alert("Failed to reject application");
    }
  }


  function proceedToLease(app: TenantApplication) {
    // Navigate to lease signing page with application data
    const userId = app.id || app.id;
    window.location.href = `/property-manager/content/lease/create?applicationId=${app.id}&tenantId=${userId}`;
  }


  const filteredInvites = invites.filter((invite) => {
    const matchesSearch =
      invite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invite.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACCEPTED" && invite.accepted) ||
      (statusFilter === "PENDING" && !invite.accepted);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "SIGNED":
      case "APPROVED":
      case "PAID":
        return "bg-green-100 text-green-700 border-navy-200";
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "DRAFT":
      case "REJECTED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "OVERDUE":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const copyInviteLink = async (token: string, email: string, leaseId: string) => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/invite/tenant/accept?email=${encodeURIComponent(email)}&token=${token}&leaseId=${leaseId}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  const validateInviteForm = () => {
    if (!selectedLeaseId) {
      setInviteError("Please select a lease");
      return false;
    }
    if (!inviteEmail.trim()) {
      setInviteError("Email is required");
      return false;
    }
    if (!inviteFirstName.trim()) {
      setInviteError("First name is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSendInvite = async () => {
    setInviteError(null);
    setInviteSuccess(null);

    if (!validateInviteForm()) {
      return;
    }

    setInviteSending(true);
    try {
      const res = await fetch("/api/auth/invites/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          firstName: inviteFirstName.trim(),
          lastName: inviteLastName.trim(),
          phone: invitePhone.trim(),
          leaseId: selectedLeaseId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      setInvites(prev => [data.tenant, ...prev]);
      setInviteSuccess("Invite sent successfully!");
      setTimeout(() => {
        setInviteSuccess(null);
        setShowInviteModal(false);
        resetInviteForm();
      }, 2000);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviteSending(false);
    }
  };

  const resetInviteForm = () => {
    setSelectedLeaseId(null);
    setInviteEmail("");
    setInviteFirstName("");
    setInviteLastName("");
    setInvitePhone("");
    setInviteError(null);
  };

  const exportToCSV = () => {
    let data: (string | number)[][] = [];
    let headers: string[] = [];
    let filename = "";

    if (activeTab === "tenants") {
      headers = ["Tenant Name", "Email", "Phone", "Property", "Unit", "Rent Amount", "Start Date", "End Date", "Status", "Balance"];
      data = filteredLeases.map(lease => [
        lease.tenant?.firstName + " " + lease.tenant?.lastName || "N/A",
        lease.tenant?.email || "N/A",
        lease.tenant?.phone || "N/A",
        lease.property?.name || lease.property?.city || "N/A",
        lease.unit?.unitNumber || "N/A",
        lease.rentAmount || "N/A",
        formatDate(lease.startDate),
        formatDate(lease.endDate),
        lease.leaseStatus,
        lease.financialSummary?.balance || "N/A"
      ]);
      filename = "tenants";
    } else if (activeTab === "applications") {
      headers = ["Full Name", "Email", "Phone", "Property", "Unit", "Move-in Date", "Status", "Monthly Income", "Submitted"];
      data = filteredApplications.map(app => [
        app.fullName,
        app.email,
        app.phone,
        app.property?.name || app.property?.city || "N/A",
        app.unit?.unitNumber || "N/A",
        formatDate(app.moveInDate),
        app.status,
        app.monthlyIncome || "N/A",
        formatDate(app.createdAt)
      ]);
      filename = "applications";
    } else {
      headers = ["Email", "Name", "Phone", "Status", "Created At"];
      data = filteredInvites.map(invite => [
        invite.email,
        `${invite.firstName || ""} ${invite.lastName || ""}`.trim() || "N/A",
        invite.phone || "N/A",
        invite.accepted ? "Accepted" : "Pending",
        formatDate(invite.createdAt)
      ]);
      filename = "invites";
    }

    const csvContent = [
      headers.join(","),
      ...data.map((row: (string | number)[]) => row.map((cell: string | number) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Statistics
  const stats = leases.reduce(
    (acc, lease) => {
      acc.totalTenants = leases.length;
      if (lease.leaseStatus === "SIGNED") acc.activeLeases++;

      // Sum invoiced across all invoices
      const totalInvoiced = lease.invoice?.reduce((sum: any, inv: { amount: any; }) => sum + (inv.amount || 0), 0) || 0;

      // Sum paid ignoring reversed payments
      const totalPaid = lease.invoice?.reduce((sum: any, inv: { payment: any[]; }) => {
        const paid = inv.payment?.filter(p => !p.isReversed).reduce((pSum, p) => pSum + (p.amount || 0), 0) || 0;
        return sum + paid;
      }, 0) || 0;

      const balance = totalInvoiced - totalPaid;

      acc.totalRevenue += totalInvoiced;
      acc.totalPaid += totalPaid;
      acc.totalBalance += balance;

      return acc;
    },
    {
      totalTenants: 0,
      activeLeases: 0,
      totalRevenue: 0,
      totalPaid: 0,
      totalBalance: 0,
      pendingApplications: applications.filter(a => a.status.toLowerCase() === "pending").length,
      pendingInvites: invites.filter(i => !i.accepted).length,
    }
  );



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tenant Management</h1>
              <p className="text-slate-600 mt-1">Manage tenants, applications, invitations & payments</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Invite
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Tenants</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalTenants}</p>
                <p className="text-xs text-slate-500">{stats.activeLeases} active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Revenue</p>
                <p className="text-2xl font-bold text-green-500">$ {(stats.totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-slate-500">Paid: $ {(stats.totalPaid / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pending Items</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingApplications + stats.pendingInvites}</p>
                <p className="text-xs text-slate-500">Applications & Invites</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">$ {(stats.totalBalance / 1000).toFixed(0)}k</p>
                <p className="text-xs text-slate-500">Total pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab("tenants");
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "tenants"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Active Tenants ({stats.totalTenants})
            </button>
            <button
              onClick={() => {
                setActiveTab("applications");
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "applications"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Applications ({applications.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("invites");
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === "invites"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Invites ({invites.length})
            </button>
          </div>
        </div>

        {/* Search, Filters, and Export */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
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
              {activeTab === "tenants" && (
                <>
                  <option value="SIGNED">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="DRAFT">Draft</option>
                </>
              )}
              {activeTab === "applications" && (
                <>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </>
              )}
              {activeTab === "invites" && (
                <>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                </>
              )}
            </select>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Content Area - Tables */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Active Tenants Table */}
          {activeTab === "tenants" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Property & Unit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Monthly Rent</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">No tenants found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeases.map((lease) => (
                      <tr key={lease.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {lease.tenant?.firstName && lease.tenant?.lastName
                                  ? `${lease.tenant.firstName} ${lease.tenant.lastName}`
                                  : "Unnamed"}
                              </p>                              <p className="text-sm text-slate-500">{lease.tenant?.email}</p>
                              {lease.tenant?.phone && (
                                <p className="text-sm text-slate-500">{lease.tenant.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{lease.property?.name || lease.property?.city}</p>
                          <p className="text-sm text-slate-500">Unit {lease.unit?.unitNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">$ {lease.rentAmount?.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">/month</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            {(() => {
                              // Calculate adjusted totals considering reversed payments
                              const totalInvoiced = lease.invoice?.reduce((sum: any, inv: { amount: any; }) => sum + (inv.amount || 0), 0) || 0;
                              const totalPaid = lease.invoice?.reduce((sum: any, inv: { payment: any[]; }) => {
                                const paid = inv.payment?.filter(p => !p.isReversed).reduce((pSum, p) => pSum + (p.amount || 0), 0) || 0;
                                return sum + paid;
                              }, 0) || 0;
                              const balance = totalInvoiced - totalPaid;

                              return (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Invoiced:</span>
                                    <span className="font-semibold text-slate-900">
                                      $ {totalInvoiced.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Paid:</span>
                                    <span className="font-semibold text-green-500">
                                      $ {totalPaid.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Balance:</span>
                                    <span className={`font-semibold ${balance > 0 ? "text-red-600" : "text-green-500"}`}>
                                      $ {balance.toLocaleString()}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </td>


                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lease.leaseStatus)}`}>
                            {lease.leaseStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex justify-center w-full rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Actions
                              </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg rounded-md border border-slate-200">
                              <DropdownMenuItem
                                onClick={() => window.location.href = `/property-manager/content/lease/${lease.id}`}
                                className="flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" /> View Lease
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => window.location.href = `/property-manager/content/tenants/${lease.tenant?.id}`}
                                className="flex items-center gap-2"
                              >
                                <DollarSign className="w-4 h-4" /> Finance
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => lease.tenant && openEditModal(lease.tenant)}
                                className="flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" /> Edit Tenant
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Applications Table */}
          {activeTab === "applications" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Property & Unit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employment</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Move-in Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">No applications found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg">
                              <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{app.fullName}</p>
                              <p className="text-sm text-slate-500">{app.email}</p>
                              <p className="text-sm text-slate-500">{app.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{app.property?.name || app.property?.city}</p>
                          <p className="text-sm text-slate-500">Unit {app.unit?.unitNumber}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900">{app.jobTitle || "N/A"}</p>
                            <p className="text-xs text-slate-500">{app.employerName || "N/A"}</p>
                            <p className="text-xs text-slate-600">$ {(app.monthlyIncome || 0).toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-700">{formatDate(app.moveInDate)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowDetailModal(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Invites Table */}
          {activeTab === "invites" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvites.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">No invites found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvites.map((invite) => (
                      <tr key={invite.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <Mail className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="font-medium text-slate-900">{invite.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-700">
                            {invite.firstName || invite.lastName
                              ? `${invite.firstName || ""} ${invite.lastName || ""}`.trim()
                              : "N/A"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-700">{invite.phone || "N/A"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${invite.accepted ? getStatusColor("APPROVED") : getStatusColor("PENDING")}`}>
                            {invite.accepted ? "Accepted" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-500">{formatDate(invite.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          {!invite.accepted && (
                            <button
                              disabled={!invite?.leaseId}
                              onClick={() =>
                                copyInviteLink(
                                  invite.token,
                                  invite.email,
                                  invite.leaseId // safe now
                                )
                              }
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                              ${!invite?.leaseId
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700"}
                            `}
                            >
                              {copiedToken === invite.token ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-4 h-4" />
                                  Copy Link
                                </>
                              )}
                            </button>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Tenant Modal */}
        {isEditModalOpen && selectedTenant && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl border border-gray-200">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Tenant</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  disabled={isSaving}
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                    disabled={isSaving}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                    disabled={isSaving}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                    disabled={isSaving}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0  bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-auto ">
            <div className="bg-white rounded-lg shadow-lg rounded-2xl max-w-md w-full">
              {/* Modal Header */}
              <div className="border-b bg-blue-700 border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-100">Invite New Tenant</h2>
                <p className="text-slate-100 mt-1">Send an invitation to a new tenant</p>
              </div>

              {/* Error Message */}
              {inviteError && (
                <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{inviteError}</p>
                  </div>
                  <button
                    onClick={() => setInviteError(null)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Success Message */}
              {inviteSuccess && (
                <div className="mx-6 mt-6 bg-green-50 border border-navy-200 text-green-700 p-4 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="font-medium text-sm">{inviteSuccess}</p>
                </div>
              )}

              {/* Form Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Select Lease *</label>
                  <select
                    value={selectedLeaseId || ""}
                    onChange={(e) => setSelectedLeaseId(e.target.value || null)}
                    className="w-full border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-slate-900"
                    disabled={inviteSending}
                  >
                    <option value="">-- Select a lease ({leases.length} available) --</option>
                    {leases.map(lease => {
                      const unitNum = lease.unit?.unitNumber || "N/A";
                      const unitName = lease.unit?.unitName || "";
                      const city = lease.property?.city || "";
                      const address = lease.property?.address || "No Address";
                      const fullAddress = city && address !== city ? `${address}, ${city}` : address;
                      const displayName = unitName ? `${unitNum} (${unitName})` : unitNum;

                      return (
                        <option key={lease.id} value={lease.id}>
                          Unit {displayName} - {fullAddress}
                        </option>
                      );
                    })}
                  </select>
                  {leases.length === 0 && (
                    <p className="text-amber-600 text-xs mt-2">No leases available. Please create a lease first.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="tenant@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                    disabled={inviteSending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">First Name *</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                    disabled={inviteSending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                    disabled={inviteSending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254 7XX XXX XXX"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className="w-full border border-slate-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
                    disabled={inviteSending}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    resetInviteForm();
                  }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                  disabled={inviteSending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={inviteSending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviteSending ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Application Detail Modal */}
        {showDetailModal && selectedApplication && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Application Details</h2>
                  <p className="text-slate-600 mt-1">Complete review of tenant application</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Banner */}
                <div className={`p-4 rounded-lg border flex items-center justify-between ${selectedApplication.status === "APPROVED" || selectedApplication.status === "Approved"
                  ? "bg-green-50 border-navy-200"
                  : selectedApplication.status === "REJECTED" || selectedApplication.status === "Rejected"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                  }`}>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Current Status</p>
                    <p className={`text-lg font-bold ${selectedApplication.status === "APPROVED" || selectedApplication.status === "Approved"
                      ? "text-green-700"
                      : selectedApplication.status === "REJECTED" || selectedApplication.status === "Rejected"
                        ? "text-red-700"
                        : "text-amber-700"
                      }`}>
                      {selectedApplication.status}
                    </p>
                  </div>
                  <span className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status}
                  </span>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Full Name</p>
                      <p className="text-slate-900 font-semibold mt-1">{selectedApplication.fullName}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Date of Birth</p>
                      <p className="text-slate-900 font-semibold mt-1">
                        {selectedApplication.dob ? formatDate(selectedApplication.dob) : "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Email</p>
                      <p className="text-slate-900 font-semibold mt-1">{selectedApplication.email}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Phone</p>
                      <p className="text-slate-900 font-semibold mt-1">{selectedApplication.phone}</p>
                    </div>
                    <div className="col-span-2 bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Current Address</p>
                      <p className="text-slate-900 font-semibold mt-1">{selectedApplication.address || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Property & Unit Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-emerald-600" />
                    Property & Unit Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Property</p>
                      <p className="text-slate-900 font-semibold mt-1">
                        {selectedApplication.property?.name || selectedApplication.property?.city || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Unit Number</p>
                      <p className="text-slate-900 font-semibold mt-1">{selectedApplication.unit?.unitNumber || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Monthly Rent</p>
                      <p className="text-slate-900 font-semibold mt-1">
                        $ {(selectedApplication.unit?.rentAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Desired Move-in Date</p>
                      <p className="text-slate-900 font-semibold mt-1">{formatDate(selectedApplication.moveInDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Employment & Financial Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Employer Name</p>
                      <p className="text-slate-900 font-semibold mt-1">{selectedApplication.employerName || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Job Title</p>
                      <p className="text-slate-900 font-semibold mt-1">{selectedApplication.jobTitle || "N/A"}</p>
                    </div>
                    <div className="col-span-2 bg-green-50 border border-navy-200 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium">Monthly Income</p>
                      <p className="text-green-700 font-bold text-xl mt-1">
                        $ {(selectedApplication.monthlyIncome || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">
                        Rent-to-Income Ratio: {selectedApplication.unit?.rentAmount && selectedApplication.monthlyIncome
                          ? ((selectedApplication.unit.rentAmount / selectedApplication.monthlyIncome) * 100).toFixed(1)
                          : "N/A"}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submission Info */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 font-medium">Application Submitted</p>
                  <p className="text-slate-900 font-semibold mt-1">{formatDate(selectedApplication.createdAt)}</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3 justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                >
                  Close
                </button>
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">

                  {(selectedApplication.status === "Pending" || selectedApplication.status === "PENDING") && (
                    <>
                      <button
                        onClick={() => handleReject(selectedApplication.id)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selectedApplication.id)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                    </>
                  )}
                  {(selectedApplication.status === "Approved" || selectedApplication.status === "APPROVED") && (
                    <button
                      onClick={() => proceedToLease(selectedApplication as unknown as TenantApplication)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Proceed to Lease Signing
                    </button>

                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function setSelectedTenant(tenant: Tenant) {
  throw new Error("Function not implemented.");
}
