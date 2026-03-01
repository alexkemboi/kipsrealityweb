"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchInvoices } from "@/lib/Invoice";
import { GroupedInvoice, Invoice, Payment } from "@/app/data/FinanceData";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

interface LeaseInfo {
  tenant?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  property?: {
    name?: string;
    address?: string;
    buildingName?: string;
  };
  unit?: {
    id?: string;
    unitNumber?: string;
    unitName?: string;
  };
}

export default function LeaseInvoiceGroupPage() {
  const { id } = useParams();
  const [groupedInvoices, setGroupedInvoices] = useState<GroupedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaseInfo, setLeaseInfo] = useState<LeaseInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const leaseId = Array.isArray(id) ? id[0] : id;

    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await fetchInvoices({ lease_id: leaseId ?? '' });
        
        // data is GroupedInvoice[]
        setGroupedInvoices(data);
        
        // Extract lease info from first invoice if available
        if (data.length > 0 && data[0].invoices.length > 0) {
          const firstInvoice = data[0].invoices[0];
          setLeaseInfo({
            tenant: firstInvoice.Lease?.tenant,
            property: firstInvoice.Lease?.property,
            unit: firstInvoice.Lease?.unit,
          });
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unable to load lease invoices";
        toast.error(errorMessage);
        setGroupedInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [id]);

  // Calculate totals across all invoices
  const financialSummary = useMemo(() => {
    let totalAmount = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    
    groupedInvoices.forEach(group => {
      totalAmount += group.totalAmount || 0;
      
      group.invoices.forEach(invoice => {
        const invoicePaid = invoice.payment?.reduce((sum: number, p: Payment) => 
          sum + (p.amount || 0), 0) || 0;
        totalPaid += invoicePaid;
      });
    });
    
    totalBalance = totalAmount - totalPaid;
    
    return {
      totalAmount,
      totalPaid,
      totalBalance,
      invoiceCount: groupedInvoices.reduce((count, group) => count + group.invoices.length, 0),
      groupCount: groupedInvoices.length,
    };
  }, [groupedInvoices]);

  // Download PDF function
  const downloadPDF = () => {
    if (groupedInvoices.length === 0) {
      toast.error("No invoices to download");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Lease Invoices - ${id}`, 14, 22);
    
    // Add lease info if available
    if (leaseInfo) {
      doc.setFontSize(11);
      const tenantName = `${leaseInfo.tenant?.firstName || ''} ${leaseInfo.tenant?.lastName || ''}`.trim();
      if (tenantName) {
        doc.text(`Tenant: ${tenantName}`, 14, 35);
      }
      if (leaseInfo.property?.buildingName) {
        doc.text(`Property: ${leaseInfo.property.buildingName}`, 14, 42);
      }
      if (leaseInfo.unit?.unitNumber) {
        doc.text(`Unit: ${leaseInfo.unit.unitNumber}`, 14, 49);
      }
    }

    // Grouped invoice table
    const tableColumn = ["Due Date", "Invoice Count", "Total Amount", "Status"];
    const tableRows: string[][] = [];

    groupedInvoices.forEach((group) => {
      const dateStr = new Date(group.date).toLocaleDateString();
      const status = group.invoices.some(inv => inv.status === "OVERDUE") 
        ? "OVERDUE" 
        : group.invoices.every(inv => inv.status === "PAID") 
          ? "PAID" 
          : "PENDING";
      
      tableRows.push([
        dateStr,
        group.invoices.length.toString(),
        `$${group.totalAmount.toLocaleString()}`,
        status,
      ]);
    });

    autoTable(doc, {
      startY: leaseInfo ? 60 : 30,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
    });

    // Financial summary
    const summaryY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 0 + 10;
    doc.setFontSize(12);
    doc.text("Financial Summary", 14, summaryY);
    doc.setFontSize(10);
    doc.text(`Total Amount: $${financialSummary.totalAmount.toLocaleString()}`, 14, summaryY + 8);
    doc.text(`Total Paid: $${financialSummary.totalPaid.toLocaleString()}`, 14, summaryY + 16);
    doc.text(`Balance Due: $${financialSummary.totalBalance.toLocaleString()}`, 14, summaryY + 24);

    doc.save(`Lease-${id}-Invoices-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Navigate to individual invoice
  const viewInvoiceDetails = (invoiceId: string) => {
    router.push(`/property-manager/finance/invoices/${invoiceId}`);
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading lease invoices...</p>;
  
  const leaseId = Array.isArray(id) ? id[0] : id;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/property-manager/finance/invoices")}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition"
          >
            ← Back to Invoices
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lease Invoice Group</h1>
            <p className="text-gray-600 font-mono mt-1">Lease ID: {leaseId}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={downloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          
          <Link
            href={`/property-manager/finance/invoices/create?leaseId=${leaseId}`}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Lease Information Card */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="text-blue-600">📋</span> Lease Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Tenant</p>
            <p className="text-gray-800 text-lg font-medium">
              {leaseInfo?.tenant 
                ? `${leaseInfo.tenant.firstName || ''} ${leaseInfo.tenant.lastName || ''}`.trim() || "—"
                : "—"}
            </p>
            {leaseInfo?.tenant?.email && (
              <p className="text-gray-600 text-sm mt-1">{leaseInfo.tenant.email}</p>
            )}
          </div>
          
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Property</p>
            <p className="text-gray-800 text-lg font-medium">
              {leaseInfo?.property?.buildingName || leaseInfo?.property?.name || "—"}
            </p>
            {leaseInfo?.property?.address && (
              <p className="text-gray-600 text-sm mt-1">{leaseInfo.property.address}</p>
            )}
          </div>
          
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Unit</p>
            <p className="text-gray-800 text-lg font-medium">
              {leaseInfo?.unit?.unitName || leaseInfo?.unit?.unitNumber || "—"}
            </p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => router.push(`/property-manager/finance/tenants/${leaseInfo?.tenant?.id}`)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Tenant →
              </button>
              <button
                onClick={() => router.push(`/property-manager/content/payments?leaseId=${leaseId}`)}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Check Payments →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Card */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-green-600">💰</span> Financial Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm font-semibold text-blue-600 uppercase">Total Invoices</p>
            <p className="text-3xl font-bold text-blue-800">{financialSummary.invoiceCount}</p>
            <p className="text-sm text-blue-600 mt-1">{financialSummary.groupCount} due date groups</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-sm font-semibold text-green-600 uppercase">Total Amount</p>
            <p className="text-3xl font-bold text-green-800">$ {financialSummary.totalAmount.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">All invoices combined</p>
          </div>
          
          <div className="bg-navy-50 p-4 rounded-xl">
            <p className="text-sm font-semibold text-navy-600 uppercase">Total Paid</p>
            <p className="text-3xl font-bold text-navy-800">$ {financialSummary.totalPaid.toLocaleString()}</p>
            <p className="text-sm text-navy-600 mt-1">Received payments</p>
          </div>
          
          <div className={`p-4 rounded-xl ${financialSummary.totalBalance > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
            <p className="text-sm font-semibold uppercase">Balance Due</p>
            <p className={`text-3xl font-bold ${financialSummary.totalBalance > 0 ? 'text-red-700' : 'text-gray-700'}`}>
              $ {financialSummary.totalBalance.toLocaleString()}
            </p>
            <p className={`text-sm mt-1 ${financialSummary.totalBalance > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {financialSummary.totalBalance > 0 ? 'Outstanding balance' : 'Fully paid'}
            </p>
          </div>
        </div>
      </div>

      {/* Grouped Invoices Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-purple-600">📄</span> Grouped Invoices by Due Date
          </h2>
          <p className="text-gray-600 mt-1">Invoices grouped by their due date for this lease</p>
        </div>
        
        {groupedInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-xl font-medium text-gray-700">No invoices found</h3>
            <p className="text-gray-500 mt-2">This lease doesn't have any invoices yet.</p>
            <Link
              href={`/property-manager/finance/invoices/create?leaseId=${leaseId}`}
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Create First Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Invoice Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupedInvoices.map((group, index) => {
                  const dateStr = new Date(group.date).toLocaleDateString();
                  const isOverdue = group.invoices.some(inv => inv.status === "OVERDUE");
                  const isPaid = group.invoices.every(inv => inv.status === "PAID");
                  const isPartiallyPaid = group.invoices.some(inv => inv.status === "PAID") && !isPaid;
                  
                  let statusColor = "bg-yellow-100 text-yellow-800";
                  let statusText = "PENDING";
                  
                  if (isOverdue) {
                    statusColor = "bg-red-100 text-red-800";
                    statusText = "OVERDUE";
                  } else if (isPaid) {
                    statusColor = "bg-green-100 text-green-800";
                    statusText = "PAID";
                  } else if (isPartiallyPaid) {
                    statusColor = "bg-blue-100 text-blue-800";
                    statusText = "PARTIAL";
                  }
                  
                  return (
                    <tr key={`${group.date}-${index}`} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">{dateStr}</div>
                        <div className="text-gray-500 text-sm">
                          {new Date(group.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {group.invoices.length} invoice{group.invoices.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 font-bold">$ {group.totalAmount.toLocaleString()}</div>
                        {group.totalPaid !== undefined && group.totalPaid > 0 && (
                          <div className="text-gray-600 text-sm">
                            Paid: $ {group.totalPaid.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Show invoice details for this group
                              const invoiceIds = group.invoices.map(inv => inv.id);
                              if (invoiceIds.length === 1 && invoiceIds[0]) {
                                viewInvoiceDetails(invoiceIds[0]);
                              } else {
                                // For multiple invoices, we could show a modal or expand the row
                                toast.info(`${group.invoices.length} invoices in this group. Click individual invoices below.`);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              // Generate PDF for just this group
                              toast.success("PDF generation for this group would be implemented");
                            }}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Individual Invoice Details (collapsible if needed) */}
        {groupedInvoices.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">All Individual Invoices</h3>
            <div className="space-y-4">
              {groupedInvoices.flatMap((group, groupIndex) => 
                group.invoices.map((invoice, invoiceIndex) => {
                  const paidAmount = invoice.payment?.reduce((sum: number, p: Payment) => 
                    sum + (p.amount || 0), 0) || 0;
                  const balance = invoice.amount - paidAmount;
                  
                  return (
                    <div 
                      key={`${groupIndex}-${invoiceIndex}`} 
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition cursor-pointer"
                      onClick={() => viewInvoiceDetails(invoice.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              invoice.status === "PAID" 
                                ? "bg-green-100 text-green-800" 
                                : invoice.status === "OVERDUE" 
                                  ? "bg-red-100 text-red-800" 
                                  : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {invoice.status}
                            </span>
                            <span className="font-mono text-sm text-gray-600">{invoice.id.slice(0, 8)}...</span>
                            <span className="text-gray-700 font-medium">{invoice.type}</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">$ {invoice.amount.toLocaleString()}</p>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Paid: $ {paidAmount.toLocaleString()}</span>
                            <span>Balance: $ {balance.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-sm text-gray-500">
          <p>Showing invoices for lease: <span className="font-mono">{leaseId}</span></p>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/property-manager/finance/invoices/create?leaseId=${leaseId}&type=RENT`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Rent Invoice
          </Link>
          
          <Link
            href={`/property-manager/finance/invoices/create?leaseId=${leaseId}&type=UTILITY`}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Create Utility Invoice
          </Link>
          
          <button
            onClick={() => router.push(`/property-manager/content/payments?leaseId=${leaseId}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Manage Payments
          </button>
        </div>
      </div>
    </div>
  );
}