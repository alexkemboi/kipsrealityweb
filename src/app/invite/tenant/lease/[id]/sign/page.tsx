"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number | null;
  leaseTerm: string | null;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  leaseStatus: string;
  userRole?: "landlord" | "tenant" | null;
  tenant?: { id: string; email: string };
  property?: { id: string; name: string; managerId: string };
  unit?: { id: string; unitNumber: string };
}

export default function LeaseSignPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leaseId = params.id as string;
  const inviteToken = searchParams.get("token") || "";

  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [signing, setSigning] = useState(false);

  console.log("Page loaded with:", { leaseId, inviteToken }); // Debug

  // Fetch lease and determine role
  useEffect(() => {
    async function fetchLease() {
      try {
        // ALWAYS include token if available
        const url = inviteToken 
          ? `/api/lease/${leaseId}?token=${inviteToken}`
          : `/api/lease/${leaseId}`;
        
        console.log("Fetching lease from:", url); // Debug
        
        const res = await fetch(url);
        const data = await res.json();

        console.log("Lease response:", data); // Debug

        if (res.ok) {
          setLease(data);
          setUserRole(data.userRole || null);
          console.log("User role determined:", data.userRole); // Debug
        } else {
          console.error("Failed to fetch lease:", data.error);
        }
      } catch (err) {
        console.error("Error fetching lease:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLease();
  }, [leaseId, inviteToken]);

  const canSign =
    (userRole === "landlord" && !lease?.landlordSignedAt) ||
    (userRole === "tenant" && !lease?.tenantSignedAt);

  // Signing function
  async function handleSign() {
    if (!userRole) {
      alert("Unable to determine your role. Please check your invite link.");
      return;
    }

    if (userRole === "tenant" && !inviteToken) {
      alert("Missing invite token. Please use the link from your email.");
      return;
    }

    setSigning(true);

    try {
      const url = `/api/lease/${leaseId}/sign/${userRole}`;
      const body =
        userRole === "tenant" && inviteToken
          ? { token: inviteToken }
          : undefined;

      console.log("Signing lease:", { url, body }); // Debug

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();
      console.log("Sign response:", data); // Debug

      if (res.ok) {
        if (userRole === "tenant") {
          // Redirect tenant after signing with token preserved
          const redirectUrl = `/invite/accept?email=${encodeURIComponent(data.lease.tenant.email)}&token=${inviteToken}&leaseId=${data.lease.id}`;
          console.log("Redirecting to:", redirectUrl);
          window.location.href = redirectUrl;
          return;
        }

        // Landlord signed — refresh data
        alert(`Lease signed successfully as ${userRole}!`);
        setLease(data.lease);
        setUserRole(data.lease.userRole || userRole);
      } else {
        alert(data.error || "Failed to sign lease");
      }
    } catch (err) {
      console.error("Sign error:", err);
      alert("An error occurred while signing");
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lease...</p>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Lease not found</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Lease Agreement</h1>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
          <p><strong>Debug:</strong></p>
          <p>User Role: {userRole || "none"}</p>
          <p>Has Token: {inviteToken ? "yes" : "no"}</p>
          <p>Tenant Signed: {lease.tenantSignedAt ? "yes" : "no"}</p>
          <p>Landlord Signed: {lease.landlordSignedAt ? "yes" : "no"}</p>
        </div>
      )}

      {/* Role Badge */}
      {userRole && (
        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              userRole === "landlord"
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            Viewing as: {userRole === "landlord" ? "Landlord" : "Tenant"}
          </span>
        </div>
      )}

      {/* Lease Details */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Lease Information</h2>
        <div className="space-y-3">
          <p><strong>Property:</strong> {lease.property?.name || "N/A"}</p>
          <p><strong>Unit:</strong> {lease.unit?.unitNumber || "N/A"}</p>
          <p><strong>Tenant Email:</strong> {lease.tenant?.email || "N/A"}</p>
          <p>
            <strong>Lease Period:</strong>{" "}
            {new Date(lease.startDate).toLocaleDateString()} to{" "}
            {new Date(lease.endDate).toLocaleDateString()}
          </p>
          <p><strong>Lease Term:</strong> {lease.leaseTerm || "N/A"}</p>
          <p><strong>Monthly Rent:</strong> KES {lease.rentAmount?.toLocaleString()}</p>
          {lease.securityDeposit && (
            <p><strong>Security Deposit:</strong> KES {lease.securityDeposit?.toLocaleString()}</p>
          )}
        </div>

        {/* Signature Status */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-3">Signature Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {lease.landlordSignedAt ? (
                <span className="text-green-600 font-semibold">✓ Landlord Signed</span>
              ) : (
                <span className="text-gray-400">○ Landlord Pending</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lease.tenantSignedAt ? (
                <span className="text-green-600 font-semibold">✓ Tenant Signed</span>
              ) : (
                <span className="text-gray-400">○ Tenant Pending</span>
              )}
            </div>
          </div>
        </div>

        {/* Sign Button */}
        {canSign && (
          <button
            onClick={handleSign}
            disabled={signing}
            className={`mt-6 px-6 py-3 rounded-lg font-semibold ${
              signing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {signing
              ? "Signing..."
              : `Sign as ${userRole === "landlord" ? "Landlord" : "Tenant"}`}
          </button>
        )}

        {/* Messages */}
        {!canSign && userRole && lease.leaseStatus !== "SIGNED" && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-blue-800">
              ✓ You have already signed this lease. Waiting for the other party to sign.
            </p>
          </div>
        )}
        {lease.leaseStatus === "SIGNED" && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
            <p className="text-green-800 font-semibold">
              ✓ This lease has been fully executed by both parties
            </p>
          </div>
        )}
        {!userRole && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">
              You do not have permission to sign this lease.
              {!inviteToken && " Please use the invite link from your email."}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    </div>
  );
}