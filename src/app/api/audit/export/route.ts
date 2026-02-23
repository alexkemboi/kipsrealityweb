"use client";

import { useCallback, useState } from "react";

export type AuditExportFormat = "csv" | "json";

export interface AuditExportFilters {
  unitId?: string;
  listingId?: string;
  userId?: string;
  action?: string; // or import ListingAction if client-safe
  status?: string; // or import ListingStatus if client-safe
  dateFrom?: string | Date;
  dateTo?: string | Date;
}

export interface AuditExportOptions {
  format?: AuditExportFormat;
  includeMetadata?: boolean;
  filters?: AuditExportFilters;
}

function toIsoDate(value: string | Date | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.toISOString();
}

function buildQueryParams(options: AuditExportOptions): URLSearchParams {
  const params = new URLSearchParams();

  const format = options.format ?? "json";
  const includeMetadata = options.includeMetadata ?? false;
  const filters = options.filters ?? {};

  params.set("format", format);
  params.set("includeMetadata", String(includeMetadata));

  if (filters.unitId) params.set("unitId", filters.unitId);
  if (filters.listingId) params.set("listingId", filters.listingId);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.action) params.set("action", filters.action);
  if (filters.status) params.set("status", filters.status);

  const dateFrom = toIsoDate(filters.dateFrom);
  const dateTo = toIsoDate(filters.dateTo);

  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);

  return params;
}

function getFilenameFromDisposition(
  disposition: string | null,
  fallback: string
): string {
  if (!disposition) return fallback;

  // Handles: attachment; filename="listing-audit-2026-02-22.csv"
  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  if (!match?.[1]) return fallback;

  return decodeURIComponent(match[1].replace(/"/g, "").trim());
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function useAuditExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportAudit = useCallback(async (options: AuditExportOptions = {}) => {
    setIsExporting(true);
    setError(null);

    try {
      const format = options.format ?? "json";
      const params = buildQueryParams(options);

      const response = await fetch(`/api/audit/export?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        let message = "Failed to export audit data";

        try {
          const data = await response.json();
          message =
            data?.message || data?.error || `Export failed (${response.status})`;
        } catch {
          const text = await response.text();
          if (text) message = text;
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      const fallbackName = `listing-audit.${format}`;
      const filename = getFilenameFromDisposition(contentDisposition, fallbackName);

      downloadBlob(blob, filename);

      return { success: true, filename };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export audit data";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportAudit,
    isExporting,
    error,
    clearError: () => setError(null),
  };
}
