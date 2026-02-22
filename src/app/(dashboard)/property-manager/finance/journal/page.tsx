"use client";

import { useCallback, useEffect, useState } from "react";
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
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchJournal = useCallback(
    async (p = 1, q = "", signal?: AbortSignal) => {
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
      } finally {
        setLoading(false);
      }
    },
    []
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
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description or ref..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
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

      {error && (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
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
            </button>

            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
              aria-label="Next page"
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </main>
  );
}
