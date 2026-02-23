"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Download, RefreshCcw } from "lucide-react";

/* =========================================================
   Types (match your routes)
========================================================= */

type ListingAction = string;
type ListingStatus = string;

type Filters = {
  unitId?: string;
  listingId?: string;
  userId?: string;
  action?: ListingAction;
  status?: ListingStatus;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
};

type AuditTrailQuery = Filters & {
  limit: number;
  offset: number;
};

type AuditTrailResponse = {
  success: boolean;
  data: {
    items?: any[];
    total?: number;
    limit?: number;
    offset?: number;
    // allow other shapes without breaking
    [key: string]: any;
  };
};

type AuditStatisticsResponse = {
  success: boolean;
  data: {
    totalEntries?: number;
    actionBreakdown?: Record<string, number>;
    statusBreakdown?: Record<string, number>;
    userActivity?: unknown;
    timelineData?: unknown;
    [key: string]: unknown;
  };
};

/* =========================================================
   Helpers
========================================================= */

function qsFromFilters(filters: Filters) {
  const p = new URLSearchParams();
  if (filters.unitId) p.set("unitId", filters.unitId);
  if (filters.listingId) p.set("listingId", filters.listingId);
  if (filters.userId) p.set("userId", filters.userId);
  if (filters.action) p.set("action", filters.action);
  if (filters.status) p.set("status", filters.status);
  if (filters.dateFrom) p.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) p.set("dateTo", filters.dateTo);
  return p.toString();
}

function qsFromTrailQuery(q: AuditTrailQuery) {
  const p = new URLSearchParams(qsFromFilters(q));
  p.set("limit", String(q.limit));
  p.set("offset", String(q.offset));
  return p.toString();
}

function asPairs(obj: unknown): Array<[string, number]> {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
  return Object.entries(obj as Record<string, unknown>)
    .map(([k, v]) => [k, typeof v === "number" ? v : Number(v ?? 0)] as [string, number])
    .filter(([, v]) => Number.isFinite(v))
    .sort((a, b) => b[1] - a[1]);
}

function labelize(s: string) {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function downloadBlob(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* =========================================================
   Single Component: Shared Filter Bar + Statistics + History + Export
========================================================= */

export default function AuditDashboardUnified() {
  // Shared filters
  const [filters, setFilters] = useState<Filters>({
    dateFrom: "",
    dateTo: "",
    listingId: "",
    unitId: "",
    userId: "",
    action: "",
    status: "",
  });

  // History pagination
  const [limit, setLimit] = useState<number>(25);
  const [offset, setOffset] = useState<number>(0);

  // Data state
  const [stats, setStats] = useState<AuditStatisticsResponse["data"] | null>(null);
  const [trail, setTrail] = useState<AuditTrailResponse["data"] | null>(null);

  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingTrail, setLoadingTrail] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [statsError, setStatsError] = useState<string | null>(null);
  const [trailError, setTrailError] = useState<string | null>(null);

  const filterQS = useMemo(() => qsFromFilters(cleanFilters(filters)), [filters]);
  const trailQS = useMemo(
    () =>
      qsFromTrailQuery({
        ...cleanFilters(filters),
        limit,
        offset,
      }),
    [filters, limit, offset]
  );

  function cleanFilters(f: Filters): Filters {
    const out: Filters = {};
    (["unitId", "listingId", "userId", "action", "status", "dateFrom", "dateTo"] as const).forEach(
      (k) => {
        const v = (f as any)[k];
        if (typeof v === "string") {
          const t = v.trim();
          if (t) (out as any)[k] = t;
        } else if (v) {
          (out as any)[k] = v;
        }
      }
    );
    return out;
  }

  const fetchStats = useCallback(async () => {
    setStatsError(null);
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/audit/statistics?${filterQS}`, {
        method: "GET",
        cache: "no-store",
      });
      const json = (await res.json().catch(() => null)) as AuditStatisticsResponse | null;
      if (!res.ok) throw new Error(json?.error || json?.message || `Stats failed (${res.status})`);
      setStats(json?.data ?? null);
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : "Failed to load statistics");
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, [filterQS]);

  const fetchTrail = useCallback(async () => {
    setTrailError(null);
    setLoadingTrail(true);
    try {
      const res = await fetch(`/api/audit/listing-history?${trailQS}`, {
        method: "GET",
        cache: "no-store",
      });
      const json = (await res.json().catch(() => null)) as AuditTrailResponse | null;
      if (!res.ok) throw new Error(json?.error || json?.message || `History failed (${res.status})`);
      setTrail(json?.data ?? null);
    } catch (e) {
      setTrailError(e instanceof Error ? e.message : "Failed to load audit history");
      setTrail(null);
    } finally {
      setLoadingTrail(false);
    }
  }, [trailQS]);

  // Unified refresh
  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchTrail()]);
    setRefreshing(false);
  }, [fetchStats, fetchTrail]);

  // Auto-load on filter/pagination change
  useEffect(() => {
    // whenever shared filters change, reset paging
    setOffset(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.listingId, filters.unitId, filters.userId, filters.action, filters.status, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTrail();
  }, [fetchTrail]);

  // Derived UI values
  const actionPairs = useMemo(() => asPairs(stats?.actionBreakdown), [stats?.actionBreakdown]);
  const statusPairs = useMemo(() => asPairs(stats?.statusBreakdown), [stats?.statusBreakdown]);

  // Try to normalize history items
  const historyItems = useMemo(() => {
    const d = trail ?? {};
    if (Array.isArray((d as any).items)) return (d as any).items as any[];
    if (Array.isArray((d as any).data)) return (d as any).data as any[];
    if (Array.isArray((d as any).records)) return (d as any).records as any[];
    if (Array.isArray((d as any).results)) return (d as any).results as any[];
    return [];
  }, [trail]);

  const totalHistory = useMemo(() => {
    const d = trail ?? {};
    const t =
      (d as any).total ??
      (d as any).count ??
      (d as any).totalCount ??
      (Array.isArray(historyItems) ? historyItems.length : 0);
    return typeof t === "number" ? t : Number(t ?? 0);
  }, [trail, historyItems]);

  // Export
  const [exporting, setExporting] = useState(false);

  const doExport = useCallback(
    async (format: "csv" | "json") => {
      try {
        setExporting(true);
        const url = `/api/audit/export?${filterQS}&format=${format}&includeMetadata=true`;
        const res = await fetch(url, { method: "GET", cache: "no-store" });
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.error || json?.message || `Export failed (${res.status})`);
        }

        const contentType = res.headers.get("Content-Type") || (format === "csv" ? "text/csv" : "application/json");
        const text = await res.text();

        const filename =
          res.headers
            .get("Content-Disposition")
            ?.match(/filename="(.+?)"/)?.[1] ||
          `listing-audit-${todayISO()}.${format}`;

        downloadBlob(text, filename, contentType);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Export failed");
      } finally {
        setExporting(false);
      }
    },
    [filterQS]
  );

  return (
    <div className="space-y-6">
      {/* Shared Filter Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Audit Dashboard</h2>
            <p className="text-sm text-gray-500">
              One filter bar controls <span className="font-medium">Statistics</span>,{" "}
              <span className="font-medium">History</span>, and{" "}
              <span className="font-medium">Export</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refreshAll}
              disabled={refreshing || loadingStats || loadingTrail}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCcw className="h-4 w-4" />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => doExport("csv")}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export CSV"}
            </button>

            <button
              type="button"
              onClick={() => doExport("json")}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export JSON"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Listing ID"
            value={filters.listingId ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, listingId: e.target.value }))}
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Unit ID"
            value={filters.unitId ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, unitId: e.target.value }))}
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="User ID"
            value={filters.userId ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, userId: e.target.value }))}
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Action"
            value={filters.action ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))}
          />
          <input
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Status"
            value={filters.status ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          />
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={filters.dateFrom ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
          />
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={filters.dateTo ?? ""}
            onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Statistics</h3>
          {loadingStats ? (
            <span className="inline-flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading
            </span>
          ) : null}
        </div>

        {statsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {statsError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Entries</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {loadingStats ? "…" : (stats?.totalEntries ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Unique Actions</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {loadingStats ? "…" : actionPairs.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Unique Statuses</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {loadingStats ? "…" : statusPairs.length}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Action Breakdown</h4>
            {loadingStats ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 rounded bg-gray-200" />
                ))}
              </div>
            ) : actionPairs.length === 0 ? (
              <p className="text-sm text-gray-500">No action data.</p>
            ) : (
              <ul className="space-y-2">
                {actionPairs.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <span className="text-sm text-gray-700">{labelize(k)}</span>
                    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-900">
                      {v}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Status Breakdown</h4>
            {loadingStats ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 rounded bg-gray-200" />
                ))}
              </div>
            ) : statusPairs.length === 0 ? (
              <p className="text-sm text-gray-500">No status data.</p>
            ) : (
              <ul className="space-y-2">
                {statusPairs.map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <span className="text-sm text-gray-700">{labelize(k)}</span>
                    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-900">
                      {v}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-4">
            <h4 className="mb-2 text-sm font-semibold text-gray-900">User Activity</h4>
            <pre className="max-h-56 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
              {JSON.stringify(stats?.userActivity ?? null, null, 2)}
            </pre>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <h4 className="mb-2 text-sm font-semibold text-gray-900">Timeline Data</h4>
            <pre className="max-h-56 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
              {JSON.stringify(stats?.timelineData ?? null, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">History</h3>
            <p className="text-xs text-gray-500">
              Showing {historyItems.length} of {Number.isFinite(totalHistory) ? totalHistory : historyItems.length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
              disabled={offset === 0 || loadingTrail}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setOffset((o) => o + limit)}
              disabled={loadingTrail || (totalHistory > 0 && offset + limit >= totalHistory)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>

            {loadingTrail ? (
              <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading
              </span>
            ) : null}
          </div>
        </div>

        {trailError ? (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {trailError}
          </div>
        ) : null}

        {historyItems.length === 0 && !loadingTrail ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-700">
            No audit history found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Listing</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {historyItems.map((row, idx) => {
                  const createdAt =
                    row?.createdAt || row?.timestamp || row?.time || row?.date || null;
                  const action = row?.action || row?.event || row?.type || "";
                  const status = row?.status || row?.listingStatus || "";
                  const listingId = row?.listingId || row?.listing?.id || "";
                  const unitId = row?.unitId || row?.unit?.id || "";
                  const userId = row?.userId || row?.user?.id || "";

                  return (
                    <tr key={row?.id ?? idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {createdAt ? new Date(createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {action ? labelize(String(action)) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {status ? labelize(String(status)) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{listingId || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{unitId || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{userId || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <details>
                          <summary className="cursor-pointer select-none text-gray-700 hover:text-gray-900">
                            View
                          </summary>
                          <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-gray-50 p-3">
                            {JSON.stringify(row, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
