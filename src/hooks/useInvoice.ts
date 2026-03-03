"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface Invoice {
  id: string;
  type: string;
  totalAmount: number;
  balance: number;
  amountPaid: number;
  status: string;
  dueDate: string;
  description?: string;
}

type UseInvoicesState = {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  count: number;
  refetch: () => Promise<void>;
};

export function useInvoices(): UseInvoicesState {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/tenant/invoices", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch invoices");
      }

      if (data?.success) {
        setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      setInvoices([]);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const count = useMemo(() => invoices.length, [invoices]);

  return {
    invoices,
    loading,
    error,
    count,
    refetch,
  };
}
