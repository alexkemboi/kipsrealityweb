"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Home,
  Wrench,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useLease } from "@/hooks/useLease";
import { useInvoices } from "@/hooks/useInvoice";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { PaymentModal } from "@/components/Dashboard/tenantsdash/PaymentModal";

const DashboardPage = () => {
  const [isLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newRequestTitle, setNewRequestTitle] = useState("");
  const [newRequestDescription, setNewRequestDescription] = useState("");
  const [newRequestPriority, setNewRequestPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");

  // Leases hook
  const {
    leases,
    activeLease,
    loading: leasesLoading,
    error: leasesError,
    refetch: refetchLeases,
  } = useLease();

  // Invoices hook
  const {
    invoices,
    loading: invoicesLoading,
    error: invoiceError,
    refetch: refetchInvoices,
  } = useInvoices();

  // Maintenance requests hook
  const {
    requests: maintenanceRequests,
    loading: maintenanceLoading,
    error: maintenanceError,
    createRequest,
  } = useMaintenanceRequests();

  const generateInviteLink = async () => {
    setIsGeneratingInvite(true);
    setInviteError(null);

    try {
      const response = await fetch("/api/auth/invites/agent/agent-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate invite link");
      }

      setInviteLink(data.inviteUrl);
    } catch (error) {
      console.error("Error generating invite:", error);
      setInviteError(error instanceof Error ? error.message : "Failed to generate invite link");
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      // To replace alert with a toast notification
      alert("Invite link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy link");
    }
  };

  const refetchAll = async () => {
    await Promise.all([refetchLeases(), refetchInvoices()]);
  };

  // Calculate days remaining in lease
  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate next rent payment info from invoices
  const getNextPaymentInfo = () => {
    if (invoices.length === 0) {
      return {
        nextPaymentDue: null,
        paymentStatus: "upcoming",
        daysUntilPayment: 0,
        amount: activeLease?.rentAmount || 0,
      };
    }

    // Find unpaid or partially paid rent invoices
    const pendingInvoices = invoices
      .filter((inv) => inv.type === "RENT" && inv.balance > 0)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

    if (pendingInvoices.length === 0) {
      return {
        nextPaymentDue: null,
        paymentStatus: "paid",
        daysUntilPayment: 0,
        amount: activeLease?.rentAmount || 0,
      };
    }

    const nextInvoice = pendingInvoices[0];
    const dueDate = new Date(nextInvoice.dueDate);
    const today = new Date();
    const daysUntil = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      nextPaymentDue: nextInvoice.dueDate,
      paymentStatus: daysUntil < 0 ? "overdue" : "upcoming",
      daysUntilPayment: daysUntil,
      amount: nextInvoice.balance,
    };
  };

  const paymentInfo = getNextPaymentInfo();

  // Use API data
  const daysRemaining = activeLease
    ? calculateDaysRemaining(activeLease.endDate)
    : 0;

  // Calculate lease duration in days
  const leaseDurationDays = activeLease
    ? Math.ceil(
        (new Date(activeLease.endDate).getTime() -
          new Date(activeLease.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 365;

  const leasePercentComplete =
    leaseDurationDays > 0
      ? ((leaseDurationDays - daysRemaining) / leaseDurationDays) * 100
      : 0;

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

  if (leasesLoading || invoicesLoading || isLoading) {
    return (
      <div className="bg-gray-50 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if API calls failed
  if (leasesError || invoiceError) {
    return (
      <div className="bg-gray-50 h-full flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{leasesError || invoiceError}</p>
          <button 
            onClick={refetchAll}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
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

  // Show message if no active lease found
  if (!activeLease) {
    return (
      <div className="bg-gray-50 h-full p-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Welcome, {user?.firstName}!</h1>
          <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-900 mb-2">No Active Lease Found</h3>
            <p className="text-yellow-700">You don&apos;t have an active lease at the moment. Please contact your property manager.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 h-screen overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">

          {/* Invite Agent */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Invite an Agent</h2>
                <p className="text-sm text-gray-600">
                  Invite a real estate agent to assist you with tenant duties.
                </p>
              </div>
            </div>

            {inviteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{inviteError}</p>
              </div>
            )}

            {!inviteLink ? (
              <button
                onClick={generateInviteLink}
                disabled={isGeneratingInvite}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isGeneratingInvite ? "Generating link..." : "Generate Agent Invite Link"}
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
                  This link will expire in <strong>1 hour</strong> if not used.
                </p>
                
                <button
                  onClick={() => {
                    setInviteLink(null);
                    setInviteError(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Generate a new link
                </button>
              </div>
            )}
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
                  <p className="text-sm text-gray-500 truncate">
                    {activeLease.property.propertyName !== 'Unnamed Property' && `${activeLease.property.propertyName}, `}
                    {activeLease.property.address}, Unit {activeLease.unit.unitNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-600 flex-shrink-0">Lease Period</span>
                  <span className="font-medium text-gray-900 text-right text-sm">
                    {new Date(activeLease.startDate).toLocaleDateString()} - {new Date(activeLease.endDate).toLocaleDateString()}
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
                      style={{ width: `${Math.min(Math.max(leasePercentComplete, 0), 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{leasePercentComplete.toFixed(0)}% of lease period completed</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Lease ends on {new Date(activeLease.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Reminder Card */}
            <div className={`bg-white rounded-lg shadow-sm border p-6 ${getPaymentStatusColor(paymentInfo.paymentStatus)}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${paymentInfo.paymentStatus === 'overdue' ? 'bg-red-100' : paymentInfo.paymentStatus === 'paid' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <CreditCard className={`w-6 h-6 ${paymentInfo.paymentStatus === 'overdue' ? 'text-red-600' : paymentInfo.paymentStatus === 'paid' ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Rent Payment</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                  <p className="text-3xl font-bold text-gray-900">${activeLease.rentAmount.toLocaleString()}</p>
                </div>

                {paymentInfo.nextPaymentDue ? (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">
                      {paymentInfo.paymentStatus === 'overdue' ? 'Overdue Payment' : 'Next Payment Due'}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Date(paymentInfo.nextPaymentDue).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    
                    {paymentInfo.paymentStatus === 'upcoming' && paymentInfo.daysUntilPayment > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                        <Clock className="w-4 h-4" />
                        <span>{paymentInfo.daysUntilPayment} days remaining</span>
                      </div>
                    )}
                    
                    {paymentInfo.paymentStatus === 'overdue' && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{Math.abs(paymentInfo.daysUntilPayment)} days overdue</span>
                      </div>
                    )}

                    {paymentInfo.amount !== activeLease.rentAmount && (
                      <p className="text-sm text-gray-600 mt-2">
                        Amount due: <span className="font-semibold">${paymentInfo.amount.toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>All payments current</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
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
                <button 
                  onClick={() => setShowNewRequestModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Request
                </button>
              </div>

              {maintenanceLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading maintenance requests...</p>
                </div>
              ) : maintenanceError ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                  <p>Error loading maintenance requests</p>
                  <p className="text-sm">{maintenanceError}</p>
                </div>
              ) : maintenanceRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No maintenance requests</p>
                  <p className="text-sm mt-2">Submit a request using the "New Request" button</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className={`p-4 rounded-lg border ${getStatusColor(request.status)}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">{request.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                              request.priority === 'high' || request.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                              request.priority === 'medium' || request.priority === 'NORMAL' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {request.priority}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{request.description}</div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <span className="whitespace-nowrap">ID: {request.id.slice(0, 8)}</span>
                            <span className="whitespace-nowrap">Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                            {request.completedDate && (
                              <span className="whitespace-nowrap">Completed: {new Date(request.completedDate).toLocaleDateString()}</span>
                            )}
                            {request.property && (
                              <span className="whitespace-nowrap">Property: {request.property.name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {request.status === 'completed' || request.status === 'COMPLETED' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : request.status === 'in_progress' || request.status === 'IN_PROGRESS' ? (
                            <Clock className="w-5 h-5 text-blue-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium capitalize whitespace-nowrap">
                            {request.status.toLowerCase().replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => router.push('/tenant/content/invoices')}
                  className="p-4 border-2 border-gray-200 hover:border-blue-400 rounded-lg text-left transition-colors group min-w-0"
                >
                  <CreditCard className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate">Payment History</h3>
                  <p className="text-sm text-gray-600 truncate">View all transactions</p>
                </button>
                  <button 
                    onClick={() => router.push('/tenant/content/lease')}
                    className="p-4 border-2 border-gray-200 hover:border-blue-400 rounded-lg text-left transition-colors group min-w-0"
                  >
                    <Home className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 truncate">Lease Documents</h3>
                    <p className="text-sm text-gray-600 truncate">Access your lease</p>
                  </button>
                <button 
                  onClick={() => setShowNewRequestModal(true)}
                  className="p-4 border-2 border-gray-200 hover:border-blue-400 rounded-lg text-left transition-colors group min-w-0"
                >
                  <Wrench className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate">Request Service</h3>
                  <p className="text-sm text-gray-600 truncate">Report an issue</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentInfo.nextPaymentDue && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          invoiceId={invoices.find(inv => inv.type === "RENT" && inv.balance > 0)?.id}
          amount={paymentInfo.amount}
          currency="USD"
          onPaymentSuccess={() => {
            refetchInvoices();
            alert("Payment successful! Your invoice will be updated shortly.");
          }}
        />
      )}

      {/* New Maintenance Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">New Maintenance Request</h2>
                <button
                  onClick={() => setShowNewRequestModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newRequestTitle}
                    onChange={(e) => setNewRequestTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newRequestDescription}
                    onChange={(e) => setNewRequestDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
                    placeholder="Provide detailed information about the issue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["LOW", "NORMAL", "HIGH", "URGENT"] as const).map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setNewRequestPriority(priority)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newRequestPriority === priority
                            ? priority === "URGENT"
                              ? "bg-red-600 text-white"
                              : priority === "HIGH"
                              ? "bg-orange-600 text-white"
                              : priority === "NORMAL"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNewRequestModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!newRequestTitle.trim() || !newRequestDescription.trim()) {
                          alert("Please fill in all required fields");
                          return;
                        }

                        const result = await createRequest({
                          title: newRequestTitle,
                          description: newRequestDescription,
                          priority: newRequestPriority,
                        });

                        if (result.success) {
                          setShowNewRequestModal(false);
                          setNewRequestTitle("");
                          setNewRequestDescription("");
                          setNewRequestPriority("NORMAL");
                          alert("Maintenance request submitted successfully!");
                        } else {
                          alert(`Failed to submit request: ${result.error}`);
                        }
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;