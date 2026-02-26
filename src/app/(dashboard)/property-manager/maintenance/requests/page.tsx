"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  initialStatus?: string | null; // "OPEN", "IN_PROGRESS", etc.
};

export default function MaintenanceRequestsClient({ initialStatus = null }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus ?? "ALL");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Keep filter in sync when navigating to a different filtered URL
  useEffect(() => {
    if (initialStatus) setStatusFilter(initialStatus);
  }, [initialStatus]);

  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (statusFilter && statusFilter !== "ALL") qs.set("status", statusFilter);
    return qs.toString();
  }, [statusFilter]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        // ✅ Update this path if your actual API route differs
        const url = `/api/maintenance/requests${queryString ? `?${queryString}` : ""}`;
        const res = await fetch(url, { credentials: "include" });

        if (!res.ok) throw new Error("Failed to load maintenance requests");
        const json = await res.json();

        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load maintenance requests");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  /**
   * Hook these into your existing UI:
   * - statusFilter / setStatusFilter for the status dropdown/tabs
   * - data for the list/table
   * - loading + error for states
   */
  return (
    <div className="h-full">
      {/* Use these in your UI */}
      {/* statusFilter, setStatusFilter, data, loading, error */}
    </div>
  );
}
