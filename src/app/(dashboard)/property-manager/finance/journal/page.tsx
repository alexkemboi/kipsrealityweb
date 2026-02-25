"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import JournalTable from "@/components/Dashboard/propertymanagerdash/finance/JournalTable";
import {
  FileText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type JournalEntry = {
  id?: string | number;
  description?: string;
  reference?: string;
  date?: string;
  amount?: number;
  [key: string]: unknown;
};

type Pagination = {
  total: number;
  pages: number;
};

type JournalApiResponse = {
  success: boolean;
  data?: JournalEntry[];
  pagination?: Pagination;
  message?: string;
};

const PAGE_SIZE = 10;

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, pages: 1 });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(t);
  }, [searchTerm]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    return params.toString();
  }, [page, debouncedSearch]);

  const fetchJournal = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/finance/journal?${queryString}`, {
          signal,
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const result: JournalApiResponse = await res.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to load journal entries.");
        }

        setEntries(Array.isArray(result.data) ? result.data : []);
        setPagination(
          result.pagination ?? {
            total: 0,
            pages: 1,
          }
        );
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return;

        const message =
          err instanceof Error ? err.message : "Failed to fetch journal entries";

        console.error("Failed to fetch journal:", err);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [queryString]
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchJournal(controller.signal);
    return () => controller.abort();
  }, [fetchJournal]);

  const canGoPrev = page > 1 && !loading;
  const canGoNext = page < pagination.pages && !loading;

  const pageSummary = useMemo(() => {
    if (pagination.total === 0) return "No journal entries found";
    return `Showing page ${page} of ${pagination.pages} • Total entries: ${pagination.total}`;
  }, [page, pagination.pages, pagination.total]);

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-8" aria-busy={loading}>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-gray-900">
            <FileText className="h-8 w-8 text-blue-600" aria-hidden="true" />
            Journal Entries
          </h1>
          <p className="font-medium text-gray-600">
            Audit trail of all financial postings and transactions.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search by description or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
              aria-label="Search journal entries"
            />
          </div>

          <button
            type="button"
            onClick={() => void fetchJournal()}
            disabled={loading}
            aria-label="Refresh journal entries"
            title="Refresh"
            className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {error && (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Unable to load journal entries</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <JournalTable data={entries} loading={loading} />

      {!loading && pagination.pages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-gray-200 pt-6"
          aria-label="Journal pagination"
        >
          <p className="text-sm text-gray-500">{pageSummary}</p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
              className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </main>
  );
}
