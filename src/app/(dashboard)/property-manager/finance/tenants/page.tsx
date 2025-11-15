// src/app/finance/tenants/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTenantsWithFinancials } from "@/lib/Invoice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchTenantsWithFinancials();
        setTenants(data || []);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load tenants");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let data = [...tenants];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((lease) => {
        const tenant =
          (lease.tenant?.name || lease.tenant?.email || "").toLowerCase();
        const property = (lease.property?.name || "").toLowerCase();
        const unit = (lease.unit?.unitNumber || "").toLowerCase();
        return tenant.includes(q) || property.includes(q) || unit.includes(q);
      });
    }

    if (statusFilter !== "ALL") {
      data = data.filter((l) => l.leaseStatus === statusFilter);
    }

    if (sortBy) {
      data.sort((a, b) => {
        let A: any = "";
        let B: any = "";
        switch (sortBy) {
          case "tenant":
            A = a.tenant?.name || a.tenant?.email || "";
            B = b.tenant?.name || b.tenant?.email || "";
            break;
          case "property":
            A = a.property?.name || "";
            B = b.property?.name || "";
            break;
          case "invoiced":
            A = a.financialSummary?.totalInvoiced || 0;
            B = b.financialSummary?.totalInvoiced || 0;
            break;
          case "paid":
            A = a.financialSummary?.totalPaid || 0;
            B = b.financialSummary?.totalPaid || 0;
            break;
          case "balance":
            A = a.financialSummary?.balance || 0;
            B = b.financialSummary?.balance || 0;
            break;
        }
        if (A < B) return sortDir === "asc" ? -1 : 1;
        if (A > B) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [tenants, search, statusFilter, sortBy, sortDir]);

  // Pagination calculations
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    // reset to page 1 when filters change
    setPage(1);
  }, [search, statusFilter, rowsPerPage, sortBy, sortDir]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tenants & Balances</h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <input
            type="text"
            placeholder="Search tenant, property, unit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg border w-full md:w-1/3"
          />

          <div className="flex gap-2 items-center w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border"
            >
              <option value="ALL">All Status</option>
              <option value="SIGNED">SIGNED</option>
              <option value="PENDING">PENDING</option>
              <option value="TERMINATED">TERMINATED</option>
            </select>

            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading…</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl shadow">
                <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                  <tr>
                    <th className="p-3 cursor-pointer" onClick={() => toggleSort("tenant")}>Tenant</th>
                    <th className="p-3 cursor-pointer" onClick={() => toggleSort("property")}>Property</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3 cursor-pointer" onClick={() => toggleSort("invoiced")}>Total Invoiced</th>
                    <th className="p-3 cursor-pointer" onClick={() => toggleSort("paid")}>Total Paid</th>
                    <th className="p-3 cursor-pointer" onClick={() => toggleSort("balance")}>Balance</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody className="text-sm">
                  {paginated.map((lease) => {
                    const tenantName =
                      lease?.tenant?.name ||
                      lease?.tenant?.email ||
                      "Unnamed Tenant";

                    const totalInvoiced = lease.financialSummary?.totalInvoiced ?? 0;
                    const totalPaid = lease.financialSummary?.totalPaid ?? 0;
                    const balance = lease.financialSummary?.balance ?? 0;

                    return (
                      <tr
                        key={lease.id}
onClick={() => router.push(`/property-manager/finance/tenants/${lease.tenant?.id || lease.id}`)}                        className="border-t hover:bg-blue-50 cursor-pointer transition"
                      >
                        <td className="p-3">{tenantName}</td>
                        <td className="p-3">{lease.property?.name || "—"}</td>
                        <td className="p-3">{lease.unit?.unitNumber || "—"}</td>
                        <td className="p-3">KES {Number(totalInvoiced).toLocaleString()}</td>
                        <td className="p-3 text-emerald-700">KES {Number(totalPaid).toLocaleString()}</td>
                        <td className={`p-3 font-semibold ${balance > 0 ? "text-red-600" : "text-emerald-700"}`}>KES {Number(balance).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lease.leaseStatus === "SIGNED" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                            {lease.leaseStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, total)} of {total}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </button>

                {/* page numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button
                      key={p}
                      className={`px-3 py-1 border rounded ${p === page ? "bg-blue-600 text-white" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
