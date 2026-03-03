"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface Lease {
  id: string;
  property: {
    propertyName: string;
    address: string;
  };
  unit: {
    unitNumber: string;
  };
  rentAmount: number;
  startDate: string;
  endDate: string;
  leaseStatus: string;
}

type UseLeaseState = {
  leases: Lease[];
  activeLease: Lease | null;
  loading: boolean;
  error: string | null;
  count: number;
  refetch: () => Promise<void>;
};

export function useLease(): UseLeaseState {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch authenticated tenant's leases
      const res = await fetch("/api/tenant/leases", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch leases");
      }

      if (data?.success) {
        setLeases(Array.isArray(data.leases) ? data.leases : []);
      } else {
        setLeases([]);
      }
    } catch (err) {
      setLeases([]);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const activeLease = useMemo(() => {
    if (!leases.length) return null;
    return leases.find((l) => l.leaseStatus === "ACTIVE") || leases[0] || null;
  }, [leases]);

  return {
    leases,
    activeLease,
    loading,
    error,
    count: leases.length,
    refetch,
  };
}
