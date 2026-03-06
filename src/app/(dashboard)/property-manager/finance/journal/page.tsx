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
  data: JournalEntry[];
  pagination?: Pagination;
  message?: string;
};

const PAGE_SIZE = 10;

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 1,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
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
          cache: "no-store",
          ...(signal ? { signal } : {})
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
      } catch (err) {
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
    fetchJournal(controller.signal);
    return () => controller.abort();
  }, [fetchJournal]);

  const canGoPrev = page > 1 && !loading;
  const canGoNext = page < pagination.pages && !loading;

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-8" aria-busy={loading}>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-gray-900">
            <FileText className="h-8 w-8 text-blue-600" />
            Journal Entries
          </h1>
          <p className="text-gray-600 font-medium">
            Audit trail of all financial postings and transactions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description or ref..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchJournal()}
            disabled={loading}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Unable to load journal entries</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <JournalTable data={entries as any} loading={loading} />

      {!loading && pagination.pages > 1 && (
        <nav className="flex items-center justify-between border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-bold text-gray-900">{page}</span> of{" "}
            <span className="font-bold text-gray-900">
              {pagination.pages}
            </span>{" "}
            • Total:{" "}
            <span className="font-bold text-gray-900">
              {pagination.total}
            </span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setPage((prev) => prev - 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setPage((prev) => prev + 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </nav>
      )}
    </main>
  );
}