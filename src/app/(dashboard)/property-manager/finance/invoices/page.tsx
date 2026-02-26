"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchInvoices } from "@/lib/Invoice";
import { GroupedInvoice } from "@/app/data/FinanceData";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CreateInvoiceModal from "@/components/Dashboard/propertymanagerdash/CreateInvoiceModal";

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filters from URL (first render)
  // URL -> initial state
  const initialStatus = searchParams.get("status") ?? "";
  const initialType = searchParams.get("type") ?? "";
  const initialPastDue = searchParams.get("pastDue") ?? "";

  const [invoiceGroups, setInvoiceGroups] = useState<GroupedInvoice[]>([]);
  const [status, setStatus] = useState<string>(initialStatus);
  const [type, setType] = useState<string>(initialType);
  const [pastDue, setPastDue] = useState<string>(initialPastDue); // "1" or ""

  // Keep URL in sync with UI filters
  useEffect(() => {
    const qs = new URLSearchParams();

    if (status) qs.set("status", status);
    if (type) qs.set("type", type);
    if (pastDue === "1") qs.set("pastDue", "1");

    const q = qs.toString();
    router.replace(`/property-manager/finance/invoices${q ? `?${q}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type, pastDue]);
  const queryString = useMemo(() => {
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (type) qs.set("type", type);
    if (pastDue === "1") qs.set("pastDue", "1");
    return qs.toString();
  }, [status, type, pastDue]);

  // Keep URL synced with filters
  useEffect(() => {
    router.replace(`/property-manager/finance/invoices${queryString ? `?${queryString}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const loadInvoices = async () => {
    try {
      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (pastDue === "1") filters.pastDue = "1";

      const data = await fetchInvoices(filters);
      setInvoiceGroups(data);
    } catch {
      toast.error("Failed to load invoices");
    }
  };

  useEffect(() => {
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type, pastDue]);

  const downloadPDF = () => {
    if (invoiceGroups.length === 0) {
      toast.error("No invoices to download");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Grouped Invoice List", 14, 22);

    const tableColumn = ["Lease ID", "Invoice Count", "Total Amount"];
    const tableRows: any[] = [];

    invoiceGroups.forEach((group) => {
      tableRows.push([
        group.leaseId,
        group.invoices.length,
        group.totalAmount.toLocaleString(),
      ]);
    });

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
    });

    doc.save(`Invoices_${new Date().toISOString()}.pdf`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📄 Invoices (Grouped)</h1>
          <CreateInvoiceModal />
        </div>

        {/* Filters + Download Button */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
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
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DAMAGE">Damage</option>
          </select>

          {/* Past due toggle (supports pastDue=1) */}
          {/* ✅ pastDue filter */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={pastDue === "1"}
              onChange={(e) => setPastDue(e.target.checked ? "1" : "")}
            />
            Past due only
          </label>

          <button
            onClick={loadInvoices}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            Refresh
          </button>

          <button
            onClick={downloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium border border-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl shadow-md border border-gray-200 bg-white">
          <table className="min-w-full">
            <thead className="bg-blue-100 text-gray-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Lease ID</th>
                <th className="px-6 py-3 text-left">Invoices Count</th>
                <th className="px-6 py-3 text-left">Total Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {invoiceGroups.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500 italic">
                    No grouped invoices found.
                  </td>
                </tr>
              ) : (
                invoiceGroups.map((group) => (
                  <tr
                    key={group.leaseId}
                    onClick={() =>
                      router.push(`/property-manager/finance/invoices/group/${group.leaseId}`)
                    }
                    className="cursor-pointer hover:bg-blue-50 transition"
                  >
                    <td className="px-6 py-4 font-mono text-blue-600">{group.leaseId}</td>
                    <td className="px-6 py-4">{group.invoices.length}</td>
                    <td className="px-6 py-4 font-semibold">
                      {group.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
