//app/(dashboard)/property-manager/content/lease/[id]/sign/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  tenant?: {
    id: string;
    email: string;
  };
  property?: {
    id: string;
    name: string;
    managerId: string;
  };
  unit?: {
    id: string;
    unitNumber: string;
  };
}

export default function LeaseSignPage() {
  const params = useParams();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    async function fetchLease() {
      try {
        const res = await fetch(`/api/lease/${leaseId}`);
        const data = await res.json();

        if (res.ok) {
          setLease(data);
          setUserRole(data.userRole);
        } else {
          console.error("Failed to fetch lease:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch lease:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLease();
  }, [leaseId]);

  async function handleSign() {
    if (!userRole) {
      alert("Unable to determine your role");
      return;
    }

    setSigning(true);

    try {
      const res = await fetch(`/api/lease/${leaseId}/sign/${userRole}`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Lease signed successfully as ${userRole}!`);
        setLease(data.lease);
        // Refresh to get updated data with userRole
        window.location.reload();
      } else {
        alert(data.error || "Failed to sign lease");
      }
    } catch (error) {
      console.error("Sign error:", error);
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

  const canSign =
    userRole &&
    (userRole === "landlord" ? !lease.landlordSignedAt : !lease.tenantSignedAt);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Lease Agreement</h1>

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
          <p>
            <strong>Property:</strong> {lease.property?.name || "N/A"}
          </p>
          <p>
            <strong>Unit:</strong> {lease.unit?.unitNumber || "N/A"}
          </p>
          <p>
            <strong>Tenant Email:</strong> {lease.tenant?.email || "N/A"}
          </p>
          <p>
            <strong>Lease Period:</strong>{" "}
            {new Date(lease.startDate).toLocaleDateString()} to{" "}
            {new Date(lease.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Lease Term:</strong> {lease.leaseTerm || "N/A"}
          </p>
          <p>
            <strong>Monthly Rent:</strong> ${lease.rentAmount?.toLocaleString()}
          </p>
          {lease.securityDeposit && (
            <p>
              <strong>Security Deposit:</strong> $
              {lease.securityDeposit?.toLocaleString()}
            </p>
          )}
        </div>

        {/* Signature Status */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-3">Signature Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {lease.landlordSignedAt ? (
                <span className="text-navy-700 font-semibold">
                  ✓ Landlord Signed
                </span>
              ) : (
                <span className="text-gray-400">○ Landlord Pending</span>
              )}
              {lease.landlordSignedAt && (
                <span className="text-sm text-gray-500">
                  ({new Date(lease.landlordSignedAt).toLocaleDateString()})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {lease.tenantSignedAt ? (
                <span className="text-navy-700 font-semibold">
                  ✓ Tenant Signed
                </span>
              ) : (
                <span className="text-gray-400">○ Tenant Pending</span>
              )}
              {lease.tenantSignedAt && (
                <span className="text-sm text-gray-500">
                  ({new Date(lease.tenantSignedAt).toLocaleDateString()})
                </span>
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
              signing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {signing
              ? "Signing..."
              : `Sign as ${userRole === "landlord" ? "Landlord" : "Tenant"}`}
          </button>
        )}

        {/* Already Signed Message */}
        {userRole && !canSign && lease.leaseStatus !== "SIGNED" && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-blue-800">
              ✓ You have already signed this lease. Waiting for the other party
              to sign.
            </p>
          </div>
        )}

        {/* Fully Executed Message */}
        {lease.leaseStatus === "SIGNED" && (
          <div className="mt-6 bg-navy-50 border border-navy-200 rounded p-4">
            <p className="text-green-800 font-semibold">
              ✓ This lease has been fully executed by both parties
            </p>
          </div>
        )}

        {/* No Permission Message */}
        {!userRole && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">
              You do not have permission to sign this lease.
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