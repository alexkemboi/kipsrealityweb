"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type JsonRecord = Record<string, unknown>;

export interface ApplicationIntegrityReport extends JsonRecord {
  generatedAt?: string;
  propertyId?: string | null;
  summary?: JsonRecord;
  issues?: unknown[];
  recommendations?: string[];
}

export interface FixAssociationsResponse extends JsonRecord {
  action?: "fix-associations";
  success?: boolean;
  message?: string;
}

interface UseApplicationIntegrityOptions {
  propertyId?: string;
  enabled?: boolean;
  endpoint?: string; // default route path
}

interface UseApplicationIntegrityReturn {
  report: ApplicationIntegrityReport | null;
  loading: boolean;
  refreshing: boolean;
  fixing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  fixAssociations: () => Promise<FixAssociationsResponse>;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return (
      (typeof data?.error === "string" && data.error) ||
      (typeof data?.details === "string" && data.details) ||
      `Request failed (${res.status})`
    );
  } catch {
    return `Request failed (${res.status})`;
  }
}

export function useApplicationIntegrity(
  options: UseApplicationIntegrityOptions = {}
): UseApplicationIntegrityReturn {
  const {
    propertyId,
    enabled = true,
    endpoint = "/api/applications/integrity",
  } = options;

  const [report, setReport] = useState<ApplicationIntegrityReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [fixing, setFixing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const url = useMemo(() => {
    const u = new URL(endpoint, window.location.origin);
    if (propertyId?.trim()) u.searchParams.set("propertyId", propertyId.trim());
    return u.toString();
  }, [endpoint, propertyId]);

  const fetchReport = useCallback(
    async (isRefresh = false) => {
      if (!enabled) return;

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(await parseErrorMessage(res));
        }

        const data = (await res.json()) as ApplicationIntegrityReport;
        setReport(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load integrity report");
      } finally {
        if (isRefresh) setRefreshing(false);
        else setLoading(false);
      }
    },
    [enabled, url]
  );

  const refetch = useCallback(async () => {
    await fetchReport(true);
  }, [fetchReport]);

  const fixAssociations = useCallback(async (): Promise<FixAssociationsResponse> => {
    setFixing(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ action: "fix-associations" }),
      });

      if (!res.ok) {
        throw new Error(await parseErrorMessage(res));
      }

      const result = (await res.json()) as FixAssociationsResponse;

      // Refresh report after a successful fix
      await fetchReport(true);

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to run fix-associations";
      setError(message);
      throw err;
    } finally {
      setFixing(false);
    }
  }, [endpoint, fetchReport]);

  useEffect(() => {
    fetchReport(false);
  }, [fetchReport]);

  return {
    report,
    loading,
    refreshing,
    fixing,
    error,
    lastUpdated,
    refetch,
    fixAssociations,
  };
}
