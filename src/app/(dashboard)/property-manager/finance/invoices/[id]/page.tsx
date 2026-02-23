"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { fetchInvoiceById } from "@/lib/Invoice";
import type { UtilityItem } from "@/app/data/FinanceData";

interface Invoice {
  id: string;
  lease_id: string;
  type: "RENT" | "UTILITY";
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  postingStatus: "PENDING" | "POSTED" | "FAILED";
  createdAt: string;
  updatedAt: string;
  Lease?: {
    tenant?: {
      firstName?: string;
      lastName?: string;
    };
    property?: {
      buildingName?: string | null;
    };
  };
}

interface InvoiceWithUtilities extends Invoice {
  utilities?: UtilityItem[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return withTime ? d.toLocaleString() : d.toLocaleDateString();
}

export default function InvoiceDetailsPage() {
  const params = useParams<{ id?: string | string[] }>();
  const rawId = params?.id;
  const invoiceId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [invoice, setInvoice] = useState<InvoiceWithUtilities | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadInvoice = async () => {
      if (!invoiceId) {
        if (isMounted) {
          setLoading(false);
          toast.error("Missing invoice ID.");
        }
        return;
      }

      setLoading(true);

      try {
        const data = (await fetchInvoiceById(invoiceId)) as InvoiceWithUtilities;
        if (!isMounted) return;
        setInvoice(data ?? null);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unable to load invoice details";
        if (isMounted) {
          toast.error(message);
          setInvoice(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInvoice();

    return () => {
      isMounted = false;
    };
  }, [invoiceId]);

  const utilityTotal = useMemo(() => {
    if (invoice?.type !== "UTILITY" || !invoice.utilities?.length) return 0;

    return invoice.utilities.reduce((sum, u) => {
      const total =
        u.type === "METERED"
          ? (u.units ?? 0) * (u.unitPrice ?? 0)
          : (u.fixedAmount ?? u.amount ?? 0);
      return sum + total;
    }, 0);
  }, [invoice]);

  const tenantName = useMemo(() => {
    const first = invoice?.Lease?.tenant?.firstName ?? "";
    const last = invoice?.Lease?.tenant?.lastName ?? "";
    return `${first} ${last}`.trim() || "—";
  }, [invoice]);

  const buildingName = invoice?.Lease?.property?.buildingName || "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-live="polite">
        <p className="text-gray-500">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="alert">
        <p className="text-gray-500">Invoice not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 space-y-6">
      <header className="flex items-center mb-2">
        <h1 className="text-3xl font-bold text-gray-800">Invoice Details</h1>
      </header>

      {/* General Info */}
      <section className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6" aria-labelledby="invoice-general-info">
        <h2 id="invoice-general-info" className="sr-only">
          General invoice information
        </h2>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Invoice ID</p>
          <p className="font-mono text-gray-800 break-all">{invoice.id}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Lease ID</p>
          <p className="text-gray-800 break-all">{invoice.lease_id}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Type</p>
          <p className="text-gray-800">{invoice.type}</p>
        </div>

        {invoice.type === "RENT" && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Amount</p>
            <p className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Due Date</p>
          <p className="text-gray-800">{formatDate(invoice.dueDate)}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Status</p>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              invoice.status === "PAID"
                ? "bg-green-100 text-green-700"
                : invoice.status === "OVERDUE"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {invoice.status}
          </span>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">GL Posting Status</p>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              invoice.postingStatus === "POSTED"
                ? "bg-green-100 text-green-700"
                : invoice.postingStatus === "FAILED"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {invoice.postingStatus || "PENDING"}
          </span>
        </div>
      </section>

      {/* Tenant & Property */}
      <section className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6" aria-labelledby="tenant-property-info">
        <h2 id="tenant-property-info" className="sr-only">
          Tenant and property information
        </h2>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Tenant</p>
          <p className="text-gray-800">{tenantName}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Property</p>
          <p className="text-gray-800">{buildingName}</p>
        </div>
      </section>

      {/* Utility Breakdown */}
      {invoice.type === "UTILITY" && invoice.utilities && invoice.utilities.length > 0 && (
        <section className="bg-white rounded-2xl shadow p-6" aria-labelledby="utility-breakdown">
          <h2 id="utility-breakdown" className="text-lg font-semibold mb-4 flex items-center gap-2">
            💧 Utility Breakdown
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Utility</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Units</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price / Unit</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.utilities.map((u) => {
                  const total =
                    u.type === "METERED"
                      ? (u.units ?? 0) * (u.unitPrice ?? 0)
                      : (u.fixedAmount ?? u.amount ?? 0);

                  return (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="py-3 px-4 text-gray-800">{u.name}</td>
                      <td className="py-3 px-4 text-gray-800">{u.type}</td>
                      <td className="py-3 px-4 text-gray-800">
                        {u.type === "METERED" ? u.units ?? 0 : "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {u.type === "METERED"
                          ? formatCurrency(u.unitPrice ?? 0)
                          : u.fixedAmount != null
                          ? formatCurrency(u.fixedAmount)
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4 border-t pt-4">
            <p className="font-bold text-gray-900">Total: {formatCurrency(utilityTotal)}</p>
          </div>
        </section>
      )}

      {/* Metadata */}
      <section className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-sm text-gray-500">
          <p>Created: {formatDate(invoice.createdAt, true)}</p>
          <p>Last Updated: {formatDate(invoice.updatedAt, true)}</p>
        </div>

        <button
          type="button"
          disabled
          title="Payments view coming soon"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg opacity-60 cursor-not-allowed"
        >
          Check Payments
        </button>
      </section>
    </main>
  );
}
