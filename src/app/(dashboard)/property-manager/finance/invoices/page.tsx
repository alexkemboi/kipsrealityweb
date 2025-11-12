"use client";

import { useEffect, useState } from "react";
import { fetchInvoices } from "@/lib/Invoice";
import { Invoice,  } from "@/app/data/FinanceData";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");

  const loadInvoices = async () => {
    try {
      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;

      const data = await fetchInvoices(filters);
      setInvoices(data);
    } catch (error) {
      toast.error("Failed to load invoices");
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [status, type]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="">All Types</option>
          <option value="RENT">Rent</option>
          <option value="UTILITY">Utility</option>
        </select>

        <button
          onClick={loadInvoices}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Invoice ID</th>
              <th className="px-6 py-3 text-left">Lease ID</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Amount (KES)</th>
              <th className="px-6 py-3 text-left">Due Date</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-3 font-mono">{inv.id}</td>
                  <td className="px-6 py-3">{inv.lease_id}</td>
                  <td className="px-6 py-3">{inv.type}</td>
                  <td className="px-6 py-3">{inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td
                    className={`px-6 py-3 font-semibold ${
                      inv.status === "PAID"
                        ? "text-green-600"
                        : inv.status === "OVERDUE"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {inv.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
