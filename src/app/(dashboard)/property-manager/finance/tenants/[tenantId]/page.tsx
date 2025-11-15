// src/app/finance/tenants/[tenantId]/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { fetchInvoicesForTenant } from "@/lib/Invoice";
import { toast } from "sonner";

function groupInvoicesByDueDate(invoices: any[]) {
  // group key = ISO date (YYYY-MM-DD)
  const map: Record<string, any[]> = {};
  invoices.forEach((inv) => {
    const key = inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : "no-date";
    if (!map[key]) map[key] = [];
    map[key].push(inv);
  });

  // convert to sorted array (latest first)
  return Object.entries(map)
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default function TenantInvoicesPage() {
  const params = useParams();
  const tenantId = (params as any).tenantId;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchInvoicesForTenant(tenantId);
        setInvoices(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId]);

  const grouped = useMemo(() => groupInvoicesByDueDate(invoices), [invoices]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tenant Billing</h1>

        {loading ? (
          <div>Loading invoices…</div>
        ) : (
          <>
            {grouped.length === 0 ? (
              <div className="bg-white p-6 rounded shadow text-center">No invoices found for this tenant.</div>
            ) : (
              grouped.map((g) => (
                <div key={g.date} className="mb-6 bg-white p-6 rounded-xl shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Billing period: {g.date}</h2>
                    <div className="text-sm text-gray-600">
                      Total Due: KES{" "}
                      {g.items.reduce((s: number, inv: any) => s + (inv.amount ?? 0), 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {g.items.map((inv: any) => (
                      <div key={inv.id} className="border rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm text-gray-500 uppercase">{inv.type} Invoice</div>
                            <div className="font-medium mt-1">KES {Number(inv.amount).toLocaleString()}</div>
                          </div>
                          <div className="text-xs">
                            <div className="text-gray-500">Status</div>
                            <div className="font-semibold">{inv.status}</div>
                          </div>
                        </div>

                        {/* invoice items */}
                        <div className="mt-3 text-sm">
                          <div className="text-gray-600">Items</div>
                          <ul className="mt-2">
                            {inv.invoiceItems && inv.invoiceItems.length ? inv.invoiceItems.map((it: any) => (
                              <li key={it.id} className="flex justify-between">
                                <span>{it.description}</span>
                                <span className="font-medium">KES {Number(it.amount).toLocaleString()}</span>
                              </li>
                            )) : <li className="text-gray-400">No line items</li>}
                          </ul>
                        </div>

                        {/* payments */}
                        <div className="mt-3 text-sm">
                          <div className="text-gray-600">Payments</div>
                          <ul className="mt-2">
                            {inv.payments && inv.payments.length ? inv.payments.map((p: any) => (
                              <li key={p.id} className="flex justify-between text-sm">
                                <span>{p.method} {p.reference ? `(${p.reference})` : ""}</span>
                                <span className="font-medium">KES {Number(p.amount).toLocaleString()}</span>
                              </li>
                            )) : <li className="text-gray-400">No payments</li>}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* summary for period */}
                  <div className="mt-4 flex justify-end">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total billed</div>
                      <div className="text-lg font-bold">
                        KES {g.items.reduce((s: number, inv: any) => s + (inv.amount ?? 0), 0).toLocaleString()}
                      </div>

                      <div className="text-sm text-gray-600 mt-2">Total paid</div>
                      <div className="text-md font-medium text-emerald-600">
                        KES {g.items.reduce((s: number, inv: any) => s + ((inv.payments || []).reduce((ps: number, p: any) => ps + (p.amount ?? 0), 0)), 0).toLocaleString()}
                      </div>

                      <div className="text-sm text-gray-600 mt-2">Balance</div>
                      <div className="text-md font-bold">
                        KES {
                          (g.items.reduce((s: number, inv: any) => s + (inv.amount ?? 0), 0)
                            - g.items.reduce((s: number, inv: any) => s + ((inv.payments || []).reduce((ps: number, p: any) => ps + (p.amount ?? 0), 0)), 0)
                          ).toLocaleString()
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
