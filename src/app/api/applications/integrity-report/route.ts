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
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { applicationControlService } from "@/lib/application-control-service";

// Optional but helpful for admin/integrity endpoints
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // ✅ pass request if your helper reads headers/cookies from it
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const propertyId = url.searchParams.get("propertyId")?.trim() || undefined;

    // Generate comprehensive integrity report
    const report =
      await applicationControlService.getApplicationIntegrityReport(propertyId);

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("Error generating application integrity report:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
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
export async function POST(request: Request) {
  try {
    // ✅ pass request if your helper expects it
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { action?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const action = body?.action;

    if (action === "fix-associations") {
      // Fix application-listing associations
      const result =
        await applicationControlService.validateAndFixApplicationAssociations();

      return NextResponse.json(
        {
          action: "fix-associations",
          ...result,
        },
        { status: 200 }
      );
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
    return NextResponse.json(
      { error: "Invalid action. Supported actions: fix-associations" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error performing integrity action:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
