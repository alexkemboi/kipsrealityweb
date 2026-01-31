"use client"
import React, { useState } from "react";
import { Calendar, Home, Wrench, CreditCard, AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TenantLeasesCard } from "@/components/Dashboard/tenant-leases-card";

// Mock lease data - TO DO: replace with API call
const mockLeaseData = {
  unitNumber: "2B",
  address: "123 Main Street",
  leaseStartDate: "2024-01-15",
  leaseEndDate: "2025-01-14",
  monthlyRent: 1500,
  nextPaymentDue: "2026-02-01",
  paymentStatus: "upcoming", // "paid", "upcoming", "overdue"
  daysUntilPayment: 19
};

// Mock maintenance requests - TODO: replace with API call
const mockMaintenanceRequests = [
  {
    id: "MNT-001",
    title: "Kitchen faucet leaking",
    status: "in_progress",
    submittedDate: "2026-01-10",
    priority: "medium"
  },
  {
    id: "MNT-002",
    title: "AC not cooling properly",
    status: "completed",
    submittedDate: "2026-01-05",
    completedDate: "2026-01-08",
    priority: "high"
  }
];

const DashboardPage = () => {
  const [isLoading] = useState(false);
  const { user } = useAuth();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  const generateInviteLink = async () => {
    setIsGeneratingInvite(true);

    // TODO: Replace with API call
    setTimeout(() => {
      const fakeToken = Math.random().toString(36).substring(2, 10);
      setInviteLink(`${window.location.origin}/agent/invite/${fakeToken}`);
      setIsGeneratingInvite(false);
    }, 1000);
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied to clipboard");
  };

  // Calculate days remaining in lease
  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(mockLeaseData.leaseEndDate);
  const leasePercentComplete = ((365 - daysRemaining) / 365) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50 border-green-200";
      case "upcoming":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is floating (not linked to any organization)
  const isFloating = !user?.organization;

  if (isFloating) {
    return (
      <div className="bg-gray-50 h-full p-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Welcome to RentFlow360!</h1>
          <p className="text-lg text-gray-600 mb-8">You are not linked to any property yet.</p>

          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Have an Invite Code?</h3>
              <p className="text-blue-700 mb-4">Check your email for a link from your landlord or property manager.</p>
              <p className="text-sm text-blue-600">If you have received an invitation, click the link to join your property.</p>
            </div>

            <div className="p-6 border rounded-lg bg-white border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Looking for a place?</h3>
              <p className="text-gray-600 mb-4">Browse available properties and apply to rent.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Browse Listings (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 h-screen overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
            <p className="text-gray-600 mt-1">Your personal dashboard</p>
          </div>

          {/* Invite Agent */}
          <div className="lg:col-span-3 rounded-lg p-6 mb-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Invite an Agent</h2>
                <p className="text-sm text-gray-600">
                  Generate a secure invite link for your agent. The link expires after 6 hours.
                </p>
              </div>
            </div>

            {!inviteLink ? (
              <button
                onClick={generateInviteLink}
                disabled={isGeneratingInvite}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isGeneratingInvite ? "Generating link..." : "Generate Invite Link"}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  This link will expire in <strong>6 hours</strong> if not used.
                </p>
              </div>
            )}
          </div>

          {/* Financial Overview - New Component */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Overview</h2>
            <p className="text-gray-600 mb-6">View your leases, balances, and invoices in one place</p>
            <TenantLeasesCard />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
            {/* Lease Duration Card */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900">Lease Information</h2>
                  <p className="text-sm text-gray-500 truncate">{mockLeaseData.address}, Unit {mockLeaseData.unitNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-600 flex-shrink-0">Lease Period</span>
                  <span className="font-medium text-gray-900 text-right text-sm">
                    {new Date(mockLeaseData.leaseStartDate).toLocaleDateString()} - {new Date(mockLeaseData.leaseEndDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Days Remaining</span>
                    <span className="font-bold text-2xl text-blue-600">{daysRemaining}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(leasePercentComplete, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{leasePercentComplete.toFixed(0)}% of lease period completed</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Lease ends on {new Date(mockLeaseData.leaseEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Reminder Card */}
            <div className={`bg-white rounded-lg shadow-sm border p-6 ${getPaymentStatusColor(mockLeaseData.paymentStatus)}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${mockLeaseData.paymentStatus === 'overdue' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <CreditCard className={`w-6 h-6 ${mockLeaseData.paymentStatus === 'overdue' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Rent Payment</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                  <p className="text-3xl font-bold text-gray-900">${mockLeaseData.monthlyRent.toLocaleString()}</p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Next Payment Due</p>
                  <p className="font-semibold text-gray-900">{new Date(mockLeaseData.nextPaymentDue).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                  {mockLeaseData.paymentStatus === 'upcoming' && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>{mockLeaseData.daysUntilPayment} days remaining</span>
                    </div>
                  )}
                </div>

                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pay Rent Now
                </button>
              </div>
            </div>

            {/* Maintenance Status Card */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                    <Wrench className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 truncate">Maintenance Requests</h2>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0">
                  New Request
                </button>
              </div>

              <div className="space-y-3">
                {mockMaintenanceRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No maintenance requests</p>
                  </div>
                ) : (
                  mockMaintenanceRequests.map((request) => (
                    <div key={request.id} className={`p-4 rounded-lg border ${getStatusColor(request.status)}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">{request.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${request.priority === 'high' ? 'bg-red-100 text-red-700' :
                                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {request.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <span className="whitespace-nowrap">ID: {request.id}</span>
                            <span className="whitespace-nowrap">Submitted: {new Date(request.submittedDate).toLocaleDateString()}</span>
                            {request.completedDate && (
                              <span className="whitespace-nowrap">Completed: {new Date(request.completedDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {request.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : request.status === 'in_progress' ? (
                            <Clock className="w-5 h-5 text-blue-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium capitalize whitespace-nowrap">
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-gray-200 hover:border-blue-400 rounded-lg text-left transition-colors group min-w-0">
                  <CreditCard className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate">Payment History</h3>
                  <p className="text-sm text-gray-600 truncate">View all transactions</p>
                </button>
                <button className="p-4 border-2 border-gray-200 hover:border-blue-400 rounded-lg text-left transition-colors group min-w-0">
                  <Home className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate">Lease Documents</h3>
                  <p className="text-sm text-gray-600 truncate">Access your lease documents</p>
                </button>
                <button className="p-4 border-2 border-gray-200 hover:border-blue-400 rounded-lg text-left transition-colors group min-w-0">
                  <Wrench className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate">Maintenance</h3>
                  <p className="text-sm text-gray-600 truncate">View your requests</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;