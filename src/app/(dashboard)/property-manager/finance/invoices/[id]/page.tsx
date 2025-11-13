"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchInvoiceById } from "@/lib/Invoice";
import { UtilityItem } from "@/app/data/FinanceData";

interface Invoice {
  id: string;
  lease_id: string;
  type: "RENT" | "UTILITY";
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: string;
  updatedAt: string;
  Lease?: {
    tenant?: {
      firstName?: string;
      lastName?: string;
    };
    property?: {
      name?: string;
    };
  };
}

interface InvoiceWithUtilities extends Invoice {
  utilities?: UtilityItem[];
}

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceWithUtilities>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const invoiceId = Array.isArray(id) ? id[0] : id;

    const loadInvoice = async () => {
      try {
        const data = await fetchInvoiceById(invoiceId);
        setInvoice(data);
      } catch (err: any) {
        toast.error(err.message || "Unable to load invoice details");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  if (loading) return <p className="text-center py-20 text-gray-500">Loading...</p>;
  if (!invoice) return <p className="text-center py-20 text-gray-500">Invoice not found</p>;

  // Only calculate utility total if invoice type is UTILITY
  const utilityTotal =
    invoice.type === "UTILITY" && invoice.utilities
      ? invoice.utilities.reduce((sum, u) => {
          const total = u.type === "METERED" ? (u.units ?? 0) * (u.unitPrice ?? 0) : u.fixedAmount ?? u.amount ?? 0;
          return sum + total;
        }, 0)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 space-y-6">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold ml-6 text-gray-800">Invoice Details</h1>
      </div>

      {/* General Info */}
      <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Invoice ID</p>
          <p className="font-mono text-gray-800">{invoice.id}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Lease ID</p>
          <p className="text-gray-800">{invoice.lease_id}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Type</p>
          <p className="text-gray-800">{invoice.type}</p>
        </div>
        {invoice.type === "RENT" && (
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Amount</p>
            <p className="font-semibold text-gray-900">KES {invoice.amount.toLocaleString()}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Due Date</p>
          <p className="text-gray-800">{new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Status</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
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
      </div>

      {/* Tenant & Property */}
      <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Tenant</p>
          <p className="text-gray-800">
            {invoice.Lease?.tenant
              ? `${invoice.Lease.tenant.firstName} ${invoice.Lease.tenant.lastName}`
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase">Property</p>
          <p className="text-gray-800">{invoice.Lease?.property?.name || "—"}</p>
        </div>
      </div>

      {/* Utility Breakdown — only for UTILITY invoices */}
      {invoice.type === "UTILITY" && invoice.utilities && invoice.utilities.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">💧 Utility Breakdown</h3>

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
                    u.type === "METERED" ? (u.units ?? 0) * (u.unitPrice ?? 0) : u.fixedAmount ?? u.amount ?? 0;
                  return (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="py-3 px-4 text-gray-800">{u.name}</td>
                      <td className="py-3 px-4 text-gray-800">{u.type}</td>
                      <td className="py-3 px-4 text-gray-800">{u.type === "METERED" ? u.units ?? 0 : "—"}</td>
                      <td className="py-3 px-4 text-gray-800">
                        {u.type === "METERED"
                          ? `KES ${(u.unitPrice ?? 0).toLocaleString()}`
                          : u.fixedAmount
                          ? `KES ${u.fixedAmount.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">KES {total.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4 border-t pt-4">
            <p className="font-bold text-gray-900">Total: KES {utilityTotal.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="text-sm text-gray-500">
          <p>Created: {new Date(invoice.createdAt).toLocaleString()}</p>
          <p>Last Updated: {new Date(invoice.updatedAt).toLocaleString()}</p>
        </div>

        <button
          onClick={() => console.log("Payments button clicked")}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Check Payments
        </button>
      </div>
    </div>
  );
}
