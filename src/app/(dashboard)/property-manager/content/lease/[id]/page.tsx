"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FullInvoiceButton from "@/components/Dashboard/propertymanagerdash/invoice/CreateInvoice";
import ManualInvoiceForm from "@/components/Dashboard/propertymanagerdash/invoice/ManualInvoice";


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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lease details...</p>
        </div>
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error || "Lease not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
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
        return "bg-green-100 text-green-800 border-green-300";
      case "ACTIVE":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Lease Details</h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              lease.leaseStatus
            )}`}
          >
            {lease.leaseStatus}
          </span>
        </div>
        <p className="text-gray-500 text-sm">Lease ID: {lease.id}</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => router.push(`/property-manager/content/lease/${lease.id}/sign`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Signing Page
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Information */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🏢 Property Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Property Name</p>
              <p className="font-semibold">{lease.property?.name || "N/A"}</p>
            </div>
            {lease.property?.address && (
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-semibold">
                  {lease.property.address}
                  {lease.property.city && `, ${lease.property.city}`}
                  {lease.property.state && `, ${lease.property.state}`}
                  {lease.property.zipCode && ` ${lease.property.zipCode}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Unit Information */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🚪 Unit Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Unit Number</p>
              <p className="font-semibold">{lease.unit?.unitNumber || "N/A"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {lease.unit?.bedrooms !== null && (
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="font-semibold">{lease.unit?.bedrooms}</p>
                </div>
              )}
              {lease.unit?.bathrooms !== null && (
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="font-semibold">{lease.unit?.bathrooms}</p>
                </div>
              )}
            </div>
            {lease.unit?.squareFeet && (
              <div>
                <p className="text-sm text-gray-500">Square Feet</p>
                <p className="font-semibold">{lease.unit.squareFeet.toLocaleString()} sq ft</p>
              </div>
            )}
          </div>
        </div>

        {/* Tenant Information */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            👤 Tenant Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{lease.tenant?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tenant ID</p>
              <p className="font-mono text-sm text-gray-600">{lease.tenant?.id || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Lease Term */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📅 Lease Term
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-semibold">
                {new Date(lease.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-semibold">
                {new Date(lease.endDate).toLocaleDateString()}
              </p>
            </div>
            {lease.leaseTerm && (
              <div>
                <p className="text-sm text-gray-500">Term Length</p>
                <p className="font-semibold">{lease.leaseTerm}</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Terms */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            💰 Financial Terms
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p className="font-semibold text-2xl text-blue-600">
                {lease.unit?.currency}{lease.rentAmount.toLocaleString()}
              </p>
            </div>
            {lease.securityDeposit !== null && (
              <div>
                <p className="text-sm text-gray-500">Security Deposit</p>
                <p className="font-semibold">${lease.securityDeposit.toLocaleString()}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Due Day</p>
                <p className="font-semibold">Day {lease.paymentDueDay}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Frequency</p>
                <p className="font-semibold">{lease.paymentFrequency}</p>
              </div>
            </div>
          </div>
        </div>


     {/* Full Invoice Section */}
              <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🏢 Full Invoice
          </h2>
          <div className="space-y-3 flex flex-col items-center">
            <div>
              <p className="text-lg text-gray-500 mb-4">Generate the full invoice for this lease.</p>
            </div>
               <FullInvoiceButton leaseId={lease.id} />

          </div>
        </div>

     {/* Manual Invoice Section */}
    <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🏢 Create Manual Invoice
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Generate the full invoice for this lease.</p>
            </div>
        <ManualInvoiceForm leaseId={lease.id} />

          </div>
        </div>

        {/* Late Fees */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ⚠️ Late Fees & Penalties
          </h2>
          <div className="space-y-3">
            {lease.lateFeeFlat !== null && (
              <div>
                <p className="text-sm text-gray-500">Flat Late Fee</p>
                <p className="font-semibold">${lease.lateFeeFlat.toLocaleString()}</p>
              </div>
            )}
            {lease.lateFeeDaily !== null && (
              <div>
                <p className="text-sm text-gray-500">Daily Late Fee</p>
                <p className="font-semibold">${lease.lateFeeDaily.toLocaleString()}/day</p>
              </div>
            )}
            {lease.gracePeriodDays !== null && (
              <div>
                <p className="text-sm text-gray-500">Grace Period</p>
                <p className="font-semibold">{lease.gracePeriodDays} days</p>
              </div>
            )}
          </div>
        </div>

        {/* Utilities */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            💡 Utilities (Tenant Pays)
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {lease.tenantPaysElectric ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-gray-300">○</span>
              )}
              <span className={lease.tenantPaysElectric ? "font-semibold" : "text-gray-400"}>
                Electricity
              </span>
            </div>
            <div className="flex items-center gap-2">
              {lease.tenantPaysWater ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-gray-300">○</span>
              )}
              <span className={lease.tenantPaysWater ? "font-semibold" : "text-gray-400"}>
                Water
              </span>
            </div>
            <div className="flex items-center gap-2">
              {lease.tenantPaysTrash ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-gray-300">○</span>
              )}
              <span className={lease.tenantPaysTrash ? "font-semibold" : "text-gray-400"}>
                Trash
              </span>
            </div>
            <div className="flex items-center gap-2">
              {lease.tenantPaysInternet ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-gray-300">○</span>
              )}
              <span className={lease.tenantPaysInternet ? "font-semibold" : "text-gray-400"}>
                Internet
              </span>
            </div>
          </div>
        </div>

        {/* Termination Terms */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🚫 Termination Terms
          </h2>
          <div className="space-y-3">
            {lease.earlyTerminationFee !== null && (
              <div>
                <p className="text-sm text-gray-500">Early Termination Fee</p>
                <p className="font-semibold">${lease.earlyTerminationFee.toLocaleString()}</p>
              </div>
            )}
            {lease.terminationNoticeDays !== null && (
              <div>
                <p className="text-sm text-gray-500">Notice Period</p>
                <p className="font-semibold">{lease.terminationNoticeDays} days</p>
              </div>
            )}
            {lease.usageType && (
              <div>
                <p className="text-sm text-gray-500">Usage Type</p>
                <p className="font-semibold">{lease.usageType}</p>
              </div>
            )}
          </div>
        </div>

        {/* Signature Status */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ✍️ Signature Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                {lease.landlordSignedAt ? (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-2xl">✓</span>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">○</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">Landlord</p>
                {lease.landlordSignedAt ? (
                  <p className="text-sm text-gray-500">
                    Signed on {new Date(lease.landlordSignedAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Pending signature</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                {lease.tenantSignedAt ? (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-2xl">✓</span>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">○</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">Tenant</p>
                {lease.tenantSignedAt ? (
                  <p className="text-sm text-gray-500">
                    Signed on {new Date(lease.tenantSignedAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Pending signature</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Responsibilities */}
        {(lease.tenantResponsibilities || lease.landlordResponsibilities) && (
          <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📋 Responsibilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lease.tenantResponsibilities && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Tenant Responsibilities</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {lease.tenantResponsibilities}
                  </p>
                </div>
              )}
              {lease.landlordResponsibilities && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Landlord Responsibilities</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {lease.landlordResponsibilities}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📊 Metadata
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-semibold text-sm">
                {new Date(lease.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-semibold text-sm">
                {new Date(lease.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lease ID</p>
              <p className="font-mono text-sm text-gray-600">{lease.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}