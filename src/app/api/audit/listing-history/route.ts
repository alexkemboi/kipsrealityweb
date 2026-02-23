"use client";

import React, { useMemo, useState } from "react";
import {
  useAuditListingHistory,
  type AuditHistoryFilters,
  type AuditHistoryItem,
} from "@/hooks/useAuditListingHistory";

type ExportFormat = "csv" | "json";

interface AuditHistoryPanelProps {
  initialFilters?: AuditHistoryFilters;
  className?: string;
  title?: string;
}

function toIso(value?: string | Date): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.toISOString();
}

function toDateInputValue(value?: string | Date): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function safeString(value: unknown, fallback = "—") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function getRowTimestamp(row: AuditHistoryItem): string | undefined {
  return (
    (typeof row.createdAt === "string" && row.createdAt) ||
    (typeof row.timestamp === "string" && row.timestamp) ||
    (typeof row.occurredAt === "string" && row.occurredAt) ||
    (typeof row.updatedAt === "string" && row.updatedAt) ||
    undefined
  );
}

function getUserLabel(row: AuditHistoryItem) {
  return (
    (typeof row.user?.name === "string" && row.user.name.trim() && row.user.name) ||
    (typeof row.user?.email === "string" && row.user.email.trim() && row.user.email) ||
    (typeof row.userId === "string" && row.userId) ||
    "—"
  );
}

function getReferenceLabel(row: AuditHistoryItem) {
  const parts: string[] = [];
  if (row.listingId) parts.push(`Listing: ${row.listingId}`);
  if (row.unitId) parts.push(`Unit: ${row.unitId}`);
  return parts.length ? parts.join(" • ") : "—";
}

function buildExportQuery(
  filters: AuditHistoryFilters,
  format: ExportFormat,
  includeMetadata: boolean
) {
  const params = new URLSearchParams();

  if (filters.unitId) params.set("unitId", filters.unitId);
  if (filters.listingId) params.set("listingId", filters.listingId);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.action) params.set("action", String(filters.action));
  if (filters.status) params.set("status", String(filters.status));

  const dateFrom = toIso(filters.dateFrom);
  const dateTo = toIso(filters.dateTo);

  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);

  params.set("format", format);
  params.set("includeMetadata", String(includeMetadata));

  return params.toString();
}

function getFilenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback;
  const match =
    disposition.match(/filename\*=(?:UTF-8'')?([^;]+)/i) ||
    disposition.match(/filename="?([^"]+)"?/i);

  if (!match?.[1]) return fallback;

  try {
    return decodeURIComponent(match[1].replace(/['"]/g, "").trim());
  } catch {
    return match[1].replace(/['"]/g, "").trim();
  }
}

export default function AuditHistoryPanel({
  initialFilters,
  className = "",
  title = "Listing Audit History",
}: AuditHistoryPanelProps) {
  const {
    items,
    total,
    hasMore,
    filters,
    setFilters,
    isLoading,
    isRefreshing,
    error,
    refetch,
    currentPage,
    totalPages,
    prevPage,
    nextPage,
  } = useAuditListingHistory({
    limit: 20,
    offset: 0,
    ...initialFilters,
  });

  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const rows = useMemo(() => items ?? [], [items]);

  async function handleExport() {
    setExportError(null);
    setIsExporting(true);

    try {
      const query = buildExportQuery(filters, exportFormat, includeMetadata);
      const res = await fetch(`/api/audit/export?${query}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        let message = `Export failed (${res.status})`;
        try {
          const data = await res.json();
          message = data?.message || data?.error || message;
        } catch {
          // ignore JSON parse failure
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const fallbackName = `listing-audit.${exportFormat}`;
      const filename = getFilenameFromDisposition(disposition, fallbackName);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Failed to export audit data");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">
            {isLoading
              ? "Loading audit history..."
              : `${total} record${total === 1 ? "" : "s"} found`}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading || isRefreshing}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            aria-label="Export format"
          >
            <option value="csv">Export CSV</option>
            <option value="json">Export JSON</option>
          </select>

          <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="h-4 w-4"
            />
            Include metadata
          </label>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : `Download ${exportFormat.toUpperCase()}`}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
        <input
          type="text"
          placeholder="Listing ID"
          value={filters.listingId ?? ""}
          onChange={(e) => setFilters({ listingId: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Unit ID"
          value={filters.unitId ?? ""}
          onChange={(e) => setFilters({ unitId: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="User ID"
          value={filters.userId ?? ""}
          onChange={(e) => setFilters({ userId: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Action (e.g. CREATED)"
          value={typeof filters.action === "string" ? filters.action : ""}
          onChange={(e) => setFilters({ action: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Status (e.g. ACTIVE)"
          value={typeof filters.status === "string" ? filters.status : ""}
          onChange={(e) => setFilters({ status: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <input
          type="date"
          value={toDateInputValue(filters.dateFrom)}
          onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <div className="flex gap-2">
          <input
            type="date"
            value={toDateInputValue(filters.dateTo)}
            onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <select
            value={String(filters.limit ?? 20)}
            onChange={(e) => setFilters({ limit: Number(e.target.value) })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            aria-label="Rows per page"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Errors */}
      {error ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {exportError ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {exportError}
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-t border-gray-100 animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-44 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-52 rounded bg-gray-200" /></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr className="border-t border-gray-100">
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No audit history found.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const details =
                  row.metadata ?? row.changes ?? (row as any).description ?? (row as any).notes ?? null;

                return (
                  <tr
                    key={safeString(row.id, `row-${index}`)}
                    className="border-t border-gray-100"
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(getRowTimestamp(row))}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {safeString(row.action)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {safeString(row.status)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {getUserLabel(row)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {getReferenceLabel(row)}
                    </td>
                    <td className="max-w-[420px] px-4 py-3 text-gray-700">
                      <div
                        className="truncate"
                        title={details ? JSON.stringify(details) : "—"}
                      >
                        {details ? JSON.stringify(details) : "—"}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages} • Showing {rows.length} item
          {rows.length === 1 ? "" : "s"} • Total {total}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevPage}
            disabled={isLoading || (filters.offset ?? 0) <= 0}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={nextPage}
            disabled={isLoading || !hasMore}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
