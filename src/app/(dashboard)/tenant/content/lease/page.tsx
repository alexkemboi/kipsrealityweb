"use client";

import React, { useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface DashboardPageProps {
  leaseId?: string; // optional if used as a reusable component
}

const DashboardPage: React.FC<DashboardPageProps> = ({ leaseId }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const resolvedLeaseId = useMemo(() => {
    // 1) Prop value (if parent passes it)
    if (leaseId) return leaseId;

    // 2) Dynamic route param (e.g. /dashboard/[leaseId])
    const paramLeaseId = params?.leaseId;
    if (typeof paramLeaseId === "string") return paramLeaseId;
    if (Array.isArray(paramLeaseId) && paramLeaseId.length > 0) return paramLeaseId[0];

    // 3) Query param (e.g. /dashboard?leaseId=123)
    const queryLeaseId = searchParams.get("leaseId");
    if (queryLeaseId) return queryLeaseId;

    return undefined;
  }, [leaseId, params, searchParams]);

  const handleViewLease = () => {
    if (!resolvedLeaseId) {
      alert("Lease ID is missing");
      return;
    }

    router.push(`/tenant/content/lease/${resolvedLeaseId}`);
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center">
      <button
        type="button"
        onClick={handleViewLease}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        disabled={!resolvedLeaseId}
      >
        View Lease Details
      </button>
    </div>
  );
};

export default DashboardPage;
