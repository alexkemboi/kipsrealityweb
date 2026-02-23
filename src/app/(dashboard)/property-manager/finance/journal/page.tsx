"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import JournalTable from "@/components/Dashboard/propertymanagerdash/finance/JournalTable";
import {
  FileText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
    [queryString]
  );

  useEffect(() => {
    const controller = new AbortController();
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

export default JournalPage;
