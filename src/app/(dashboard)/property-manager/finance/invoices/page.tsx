"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchInvoices } from "@/lib/Invoice";
import { GroupedInvoice } from "@/app/data/FinanceData";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InvoicesPage() {
  const [invoiceGroups, setInvoiceGroups] = useState<GroupedInvoice[]>([]);
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const router = useRouter();

  const loadInvoices = async () => {
    try {
      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;

      const data = await fetchInvoices(filters);

      // data is now GroupedInvoice[]
      setInvoiceGroups(data);
    } catch (error) {
      toast.error("Failed to load invoices");
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [status, type]);

  // --- PDF Download function ---
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
        <h1 className="text-3xl font-bold mb-8 text-gray-800">📄 Invoices (Grouped)</h1>

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
          </select>

          <button
            onClick={loadInvoices}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            Refresh
          </button>

          <button
            onClick={downloadPDF}
            className="bg-navy-700 text-white px-5 py-2 rounded-lg shadow hover:bg-navy-800"
          >
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
