"use client";

import { useCallback, useEffect, useState } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
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

type JournalEntry = Record<string, unknown> & {
  id?: string | number;
} from "lucide-react";

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

type JournalResponse = {
  success: boolean;
  data: JournalEntry[];
  pagination?: Pagination;
  page?: number;
  limit?: number;
};

type JournalApiResponse = {
  success: boolean;
  data: JournalEntry[];
  pagination: Pagination;
  message?: string;
};

const PAGE_SIZE = 10;

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
      setPage(1); // reset to first page when search changes
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchJournal = useCallback(
    async (p = 1, q = "", signal?: AbortSignal) => {
    async (p = 1, query = "", signal?: AbortSignal) => {
const JournalPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, pages: 1 });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1); // reset to page 1 when search changes
    }, 350);

    return () => clearTimeout(t);
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
        const params = new URLSearchParams({
          page: String(p),
          limit: "10",
        });

        if (q) params.set("search", q);

        const res = await fetch(`/api/finance/journal?${params.toString()}`, {
          cache: "no-store",
          signal,
        });

        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const result = (await res.json()) as JournalApiResponse;

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch journal entries");
        }

        setEntries(Array.isArray(result.data) ? result.data : []);
        setPagination(result.pagination ?? { total: 0, pages: 1 });
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") return;

        const message =
          err instanceof Error ? err.message : "Failed to fetch journal entries";

        console.error("Failed to fetch journal:", err);
        setError(message);
        toast.error(message);
          limit: String(PAGE_SIZE),
        });

        if (query) {
          params.set("search", query);
        }

        const res = await fetch(`/api/finance/journal?${params.toString()}`, {
          signal,
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch journal (${res.status})`);
        }

        const result = (await res.json()) as JournalResponse;

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch journal entries");
        }

        setEntries(Array.isArray(result.data) ? result.data : []);
        setPagination({
          total: result.pagination?.total ?? 0,
          pages: result.pagination?.pages ?? 1,
        });
      } catch (error: unknown) {
        if ((error as { name?: string })?.name === "AbortError") return;

        const message =
          error instanceof Error ? error.message : "Failed to fetch journal entries";
        console.error("Failed to fetch journal:", error);
        setError(message);
        toast.error(message);
        const res = await fetch(`/api/finance/journal?${queryString}`, { signal });

        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const result: JournalApiResponse = await res.json();

        if (result.success) {
          setEntries(Array.isArray(result.data) ? result.data : []);
          setPagination(
            result.pagination ?? {
              total: 0,
              pages: 1,
            }
          );
        } else {
          throw new Error(result.message || "Failed to load journal entries.");
        }
      } catch (err) {
        // Ignore abort errors (normal when typing fast / unmounting)
        if ((err as Error).name === "AbortError") return;

        console.error("Failed to fetch journal:", err);
        setError((err as Error).message || "Failed to fetch journal entries.");
      } finally {
        setLoading(false);
      }
    },
    []
    [queryString]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchJournal(page, debouncedSearch, controller.signal);

    return () => controller.abort();
  }, [page, debouncedSearch, fetchJournal]);

  const canGoPrev = !loading && page > 1;
  const canGoNext = !loading && page < pagination.pages;

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8" aria-busy={loading}>
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" aria-hidden="true" />
  const canGoPrev = page > 1 && !loading;
  const canGoNext = page < pagination.pages && !loading;

  const pageSummary = useMemo(() => {
    if (pagination.total === 0) return "No journal entries found";
    return `Showing page ${page} of ${pagination.pages}`;
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
    fetchJournal(controller.signal);
    return () => controller.abort();
  }, [fetchJournal]);

  const canGoPrev = page > 1;
  const canGoNext = page < pagination.pages;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Journal Entries
          </h1>
          <p className="text-gray-600 font-medium">
            Audit trail of all financial postings and transactions.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description or ref..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-64"
              aria-label="Search journal entries"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchJournal()}
            disabled={loading}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            aria-label="Refresh journal entries"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <JournalTable data={entries} loading={loading} />

      {!loading && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Showing page{" "}
            <span className="font-bold text-gray-900">{page}</span> of{" "}
            <span className="font-bold text-gray-900">{pagination.pages}</span>
            {" • "}
            Total entries:{" "}
            <span className="font-bold text-gray-900">{pagination.total}</span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description or ref..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
              placeholder="Search by description or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
              aria-label="Search journal entries"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchJournal(page, debouncedSearch)}
            disabled={loading}
            aria-label="Refresh journal entries"
            title="Refresh"
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
            className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Refresh"
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
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Unable to load journal entries</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <JournalTable data={entries} loading={loading} />

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-gray-200 pt-6"
          aria-label="Journal pagination"
        >
          <p className="text-sm text-gray-500">
            Showing page{" "}
            <span className="font-bold text-gray-900">{page}</span> of{" "}
            <span className="font-bold text-gray-900">{pagination.pages}</span>
            {pageSummary}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              aria-label="Previous page"
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
              aria-label="Next page"
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
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
