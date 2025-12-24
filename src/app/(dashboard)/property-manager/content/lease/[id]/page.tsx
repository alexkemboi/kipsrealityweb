"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FullInvoiceButton from "@/components/Dashboard/propertymanagerdash/invoice/CreateInvoice";
import ManualInvoiceForm from "@/components/Dashboard/propertymanagerdash/invoice/ManualInvoice";
import UtilityInvoice from "@/components/Dashboard/propertymanagerdash/invoice/UtilityInvoice";
import ManualUtilityInvoice from "@/components/Dashboard/propertymanagerdash/invoice/ManualUtility";

interface Lease {
  id: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  leaseTerm: string | null;
  rentAmount: number;
  securityDeposit: number | null;
  paymentDueDay: number;
  paymentFrequency: string;
  lateFeeFlat: number | null;
  lateFeeDaily: number | null;
  gracePeriodDays: number | null;
  tenantResponsibilities: string | null;
  landlordResponsibilities: string | null;
  tenantPaysElectric: boolean;
  tenantPaysWater: boolean;
  tenantPaysTrash: boolean;
  tenantPaysInternet: boolean;
  usageType: string | null;
  earlyTerminationFee: number | null;
  terminationNoticeDays: number | null;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  leaseStatus: string;
  userRole?: "landlord" | "tenant" | null;
  tenant?: {
    id: string;
    email: string;
  };
  property?: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
  };
  unit?: {
    id: string;
    unitNumber: string;
    bedrooms: number | null;
    bathrooms: number | null;
    squareFeet: number | null;
    currency: string | null;
  };
}

export default function LeaseViewPage() {
  const params = useParams();
  const router = useRouter();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLease() {
      try {
        const res = await fetch(`/api/lease/${leaseId}`);
        const data = await res.json();

        if (res.ok) {
          setLease(data);
        } else {
          setError(data.error || "Failed to fetch lease");
        }
      } catch (err) {
        console.error("Failed to fetch lease:", err);
        setError("An error occurred while loading the lease");
      } finally {
        setLoading(false);
      }
    }

    fetchLease();
  }, [leaseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading lease details...</p>
        </div>
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">⚠</span>
          </div>
          <p className="text-xl font-semibold text-slate-800 mb-2">{error || "Lease not found"}</p>
          <p className="text-slate-500 mb-6">Unable to load the requested lease information</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SIGNED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ACTIVE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DRAFT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "EXPIRED":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Lease Agreement</h1>
              <p className="text-slate-500 text-sm font-mono">ID: {lease.id}</p>
            </div>
            <span
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 shadow-sm w-fit ${getStatusColor(
                lease.leaseStatus
              )}`}
            >
              {lease.leaseStatus}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push(`/property-manager/content/lease/${lease.id}/sign`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 font-medium"
            >
              📝 View Signing Page
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all border border-slate-200 shadow-sm font-medium"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property & Unit - Combined Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">{lease.property?.name || "Property"}</h2>
                <p className="text-blue-100 text-sm">
                  {lease.property?.address && (
                    <>
                      {lease.property.address}
                      {lease.property.city && `, ${lease.property.city}`}
                      {lease.property.state && `, ${lease.property.state}`}
                      {lease.property.zipCode && ` ${lease.property.zipCode}`}
                    </>
                  )}
                </p>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Unit</p>
                  <p className="font-bold text-lg text-slate-900">{lease.unit?.unitNumber || "N/A"}</p>
                </div>
                {lease.unit?.bedrooms !== null && (
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Bedrooms</p>
                    <p className="font-bold text-lg text-slate-900">{lease.unit?.bedrooms}</p>
                  </div>
                )}
                {lease.unit?.bathrooms !== null && (
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Bathrooms</p>
                    <p className="font-bold text-lg text-slate-900">{lease.unit?.bathrooms}</p>
                  </div>
                )}
                {lease.unit?.squareFeet && (
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Sq Ft</p>
                    <p className="font-bold text-lg text-slate-900">{lease.unit.squareFeet.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary - Enhanced */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-2">Monthly Rent</p>
                  <p className="text-5xl font-bold">
                    $ {lease.rentAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <span className="text-3xl">💰</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-emerald-400/30">
                {lease.securityDeposit !== null && (
                  <div>
                    <p className="text-emerald-100 text-xs mb-1">Security Deposit</p>
                    <p className="font-semibold text-lg">${lease.securityDeposit.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-emerald-100 text-xs mb-1">Payment Due</p>
                  <p className="font-semibold text-lg">Day {lease.paymentDueDay}</p>
                </div>
                <div>
                  <p className="text-emerald-100 text-xs mb-1">Frequency</p>
                  <p className="font-semibold text-lg">{lease.paymentFrequency}</p>
                </div>
                {lease.gracePeriodDays !== null && (
                  <div>
                    <p className="text-emerald-100 text-xs mb-1">Grace Period</p>
                    <p className="font-semibold text-lg">{lease.gracePeriodDays} days</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lease Term */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                Lease Term
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold mb-2">START DATE</p>
                  <p className="font-bold text-slate-900">
                    {new Date(lease.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-xs text-purple-600 font-semibold mb-2">END DATE</p>
                  <p className="font-bold text-slate-900">
                    {new Date(lease.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {lease.leaseTerm && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-sm text-slate-600">Term Length</p>
                  <p className="font-bold text-slate-900 text-lg">{lease.leaseTerm}</p>
                </div>
              )}
            </div>

            {/* Tenant Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Tenant Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">✉</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email Address</p>
                    <p className="font-semibold text-slate-900">{lease.tenant?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Tenant ID</p>
                  <p className="font-mono text-sm text-slate-600">{lease.tenant?.id || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Signature Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                Signature Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200">
                  {lease.landlordSignedAt && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${lease.landlordSignedAt ? "bg-emerald-100" : "bg-slate-200"
                      }`}>
                      <span className={`text-2xl ${lease.landlordSignedAt ? "text-emerald-600" : "text-slate-400"}`}>
                        🏢
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Landlord</p>
                      <p className="text-xs text-slate-500">Property Owner</p>
                    </div>
                  </div>
                  {lease.landlordSignedAt ? (
                    <p className="text-sm text-slate-600">
                      Signed {new Date(lease.landlordSignedAt).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 font-medium">⏳ Pending signature</p>
                  )}
                </div>

                <div className="relative p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200">
                  {lease.tenantSignedAt && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${lease.tenantSignedAt ? "bg-emerald-100" : "bg-slate-200"
                      }`}>
                      <span className={`text-2xl ${lease.tenantSignedAt ? "text-emerald-600" : "text-slate-400"}`}>
                        👤
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Tenant</p>
                      <p className="text-xs text-slate-500">Resident</p>
                    </div>
                  </div>
                  {lease.tenantSignedAt ? (
                    <p className="text-sm text-slate-600">
                      Signed {new Date(lease.tenantSignedAt).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 font-medium">⏳ Pending signature</p>
                  )}
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            {(lease.tenantResponsibilities || lease.landlordResponsibilities) && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Responsibilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lease.tenantResponsibilities && (
                    <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span>👤</span> Tenant
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {lease.tenantResponsibilities}
                      </p>
                    </div>
                  )}
                  {lease.landlordResponsibilities && (
                    <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <span>🏢</span> Landlord
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {lease.landlordResponsibilities}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Invoice Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🧾</span>
                Invoicing
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-900 font-medium mb-3">Full Invoice</p>
                  <FullInvoiceButton leaseId={lease.id} />
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-900 font-medium mb-3">Utility Invoice</p>
                  <UtilityInvoice leaseId={lease.id} />
                </div>
              </div>
            </div>

            {/* Manual Invoice */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                Manual Invoice
              </h3>
              <p className="text-sm text-slate-600 mb-4">Create a custom invoice for this lease</p>
              <ManualInvoiceForm leaseId={lease.id} />
            </div>

            {/* Utilities */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Utilities
              </h3>
              <p className="text-xs text-slate-500 mb-3">Tenant Responsibility</p>
              <div className="space-y-2">
                {[
                  { key: lease.tenantPaysElectric, label: "Electricity", icon: "⚡" },
                  { key: lease.tenantPaysWater, label: "Water", icon: "💧" },
                  { key: lease.tenantPaysTrash, label: "Trash", icon: "🗑️" },
                  { key: lease.tenantPaysInternet, label: "Internet", icon: "🌐" }
                ].map((utility, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${utility.key
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-slate-50 border border-slate-200"
                      }`}
                  >
                    <span className={`flex items-center gap-2 ${utility.key ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                      <span>{utility.icon}</span>
                      {utility.label}
                    </span>
                    <span className={utility.key ? "text-emerald-600 font-bold" : "text-slate-300"}>
                      {utility.key ? "✓" : "○"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Late Fees */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Late Fees
              </h3>
              <div className="space-y-3">
                {lease.lateFeeFlat !== null && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-600 mb-1">Flat Fee</p>
                    <p className="font-bold text-amber-900">${lease.lateFeeFlat.toLocaleString()}</p>
                  </div>
                )}
                {lease.lateFeeDaily !== null && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600 mb-1">Daily Fee</p>
                    <p className="font-bold text-red-900">${lease.lateFeeDaily.toLocaleString()}/day</p>
                  </div>
                )}
              </div>
            </div>

            {/* Termination */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🚫</span>
                Termination
              </h3>
              <div className="space-y-3">
                {lease.earlyTerminationFee !== null && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Early Termination Fee</p>
                    <p className="font-bold text-slate-900">${lease.earlyTerminationFee.toLocaleString()}</p>
                  </div>
                )}
                {lease.terminationNoticeDays !== null && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Notice Period</p>
                    <p className="font-bold text-slate-900">{lease.terminationNoticeDays} days</p>
                  </div>
                )}
                {lease.usageType && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Usage Type</p>
                    <p className="font-bold text-slate-900">{lease.usageType}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-slate-800 text-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Metadata
              </h3>
              <div className="space-y-3 text-sm">
                <div className="pb-3 border-b border-slate-700">
                  <p className="text-slate-400 text-xs mb-1">Created</p>
                  <p className="font-mono">{new Date(lease.createdAt).toLocaleString()}</p>
                </div>
                <div className="pb-3 border-b border-slate-700">
                  <p className="text-slate-400 text-xs mb-1">Last Updated</p>
                  <p className="font-mono">{new Date(lease.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Lease ID</p>
                  <p className="font-mono text-xs break-all">{lease.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}