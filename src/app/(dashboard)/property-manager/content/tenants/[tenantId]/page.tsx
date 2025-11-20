"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { fetchInvoicesForTenant, downloadInvoicePDF } from "@/lib/Invoice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, DollarSign, CreditCard, AlertCircle, Eye, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatCurrency(amount: number) {
  return `KES ${Number(amount).toLocaleString()}`;
}

function formatDate(dateString: string) {
  if (!dateString || dateString === "no-date") return "No Due Date";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function groupInvoicesByDate(invoices: any[]) {
  const groups: { [key: string]: any[] } = {};
  
  invoices.forEach((invoice) => {
    const dateKey = invoice.dueDate 
      ? new Date(invoice.dueDate).toISOString().split('T')[0]
      : 'no-date';
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(invoice);
  });

  // Convert to array and sort by date (most recent first)
  return Object.entries(groups)
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }))
    .sort((a, b) => {
      if (a.date === 'no-date') return 1;
      if (b.date === 'no-date') return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

// Helper function to calculate invoice balance
function calculateInvoiceBalance(invoice: any): number {
  const totalPaid = invoice.payments?.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) || 0;
  return (invoice.amount || 0) - totalPaid;
}

export default function TenantInvoicesPage() {
  const params = useParams();
  const tenantId = (params as any).tenantId;

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const filteredInvoices = useMemo(() => {
    if (statusFilter === "all") return invoices;
    return invoices.filter(invoice => 
      invoice.status?.toLowerCase() === statusFilter.toLowerCase()
    );
  }, [invoices, statusFilter]);

  const groupedInvoices = useMemo(() => groupInvoicesByDate(filteredInvoices), [filteredInvoices]);

  const financialSummary = useMemo(() => {
    const totalBilled = filteredInvoices.reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
    const totalPaid = filteredInvoices.reduce(
      (sum, inv) => sum + (inv.payments || []).reduce((ps: number, p: any) => ps + (p.amount ?? 0), 0),
      0
    );
    const balance = totalBilled - totalPaid;

    return { totalBilled, totalPaid, balance };
  }, [filteredInvoices]);

  const toggleInvoiceExpansion = (invoiceId: string) => {
    const newExpanded = new Set(expandedInvoices);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
    }
    setExpandedInvoices(newExpanded);
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8 bg-gray-300" />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => ( // Added one more for balance column
                    <th key={i} className="px-6 py-4 text-left">
                      <Skeleton className="h-4 w-20 bg-gray-300" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row} className="border-b border-gray-100">
                    {[1, 2, 3, 4, 5, 6, 7].map((cell) => ( // Added one more for balance column
                      <td key={cell} className="px-6 py-4">
                        <Skeleton className="h-4 w-24 bg-gray-300" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tenant Billing</h1>
            <p className="text-gray-600">View and manage all your invoices and payments</p>
          </div>
          {invoices.length > 0 && (
            <div className="mt-4 lg:mt-0 flex gap-4 items-center">
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Total Invoices</div>
                <div className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Summary */}
        {invoices.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200 min-w-32">
                  <div className="text-sm text-gray-600 mb-1">Total Billed</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(financialSummary.totalBilled)}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200 min-w-32">
                  <div className="text-sm text-gray-600 mb-1">Total Paid</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(financialSummary.totalPaid)}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200 min-w-32">
                  <div className="text-sm text-gray-600 mb-1">Balance</div>
                  <div className={`text-lg font-bold ${
                    financialSummary.balance > 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    {formatCurrency(financialSummary.balance)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {groupedInvoices.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 py-16 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {statusFilter === "all" ? "No invoices found" : "No invoices match the filter"}
            </h3>
            <p className="text-gray-600">
              {statusFilter === "all" 
                ? "There are no invoices available for this tenant." 
                : `No invoices with status "${statusFilter}" found.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Balance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payments</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groupedInvoices.map((group) => {
                  const groupId = `group-${group.date}`;
                  const isGroupExpanded = expandedGroups.has(groupId);
                  const groupTotal = group.items.reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
                  const groupPaid = group.items.reduce(
                    (sum, inv) => sum + (inv.payments || []).reduce((ps: number, p: any) => ps + (p.amount ?? 0), 0),
                    0
                  );
                  const groupBalance = groupTotal - groupPaid;

                  return (
                    <React.Fragment key={groupId}>
                      {/* Group Header Row */}
                      <tr className="bg-blue-50 border-b border-blue-100">
                        <td colSpan={7} className="px-6 py-3"> {/* Updated colSpan to 7 */}
                          <button
                            onClick={() => toggleGroupExpansion(groupId)}
                            className="flex items-center gap-3 text-left w-full hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
                          >
                            {isGroupExpanded ? (
                              <ChevronDown className="h-5 w-5 text-blue-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-blue-600" />
                            )}
                            <div className="flex items-center gap-4">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  Due Date: {formatDate(group.date)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {group.items.length} invoice(s) • Total: {formatCurrency(groupTotal)} • Balance: {formatCurrency(groupBalance)}
                                </div>
                              </div>
                            </div>
                          </button>
                        </td>
                      </tr>

                      {/* Group Invoice Rows */}
                      {isGroupExpanded && group.items.map((invoice) => {
                        const isExpanded = expandedInvoices.has(invoice.id);
                        const invoiceBalance = calculateInvoiceBalance(invoice);
                        
                        return (
                          <React.Fragment key={invoice.id}>
                            <tr 
                              className="hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => toggleInvoiceExpansion(invoice.id)}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {invoice.type} Invoice
                                    </div>
                                    
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-900">
                                    {formatDate(invoice.dueDate)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-gray-400" />
                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(invoice.amount)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`flex items-center gap-2 ${
                                  invoiceBalance > 0 ? "text-red-600" : "text-green-600"
                                }`}>
                                  <AlertCircle className={`h-4 w-4 ${
                                    invoiceBalance > 0 ? "text-red-500" : "text-green-500"
                                  }`} />
                                  <span className="font-semibold">
                                    {formatCurrency(invoiceBalance)}
                                  </span>
                                </div>
                                {invoiceBalance > 0 && (
                                  <div className="text-xs text-red-500 mt-1">
                                    Outstanding
                                  </div>
                                )}
                                {invoiceBalance <= 0 && (
                                  <div className="text-xs text-green-500 mt-1">
                                    Paid in full
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant="outline" 
                                  className={`${getStatusColor(invoice.status)} font-medium border`}
                                >
                                  {invoice.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {invoice.payments?.length || 0} payment(s)
                                </div>
                                <div className="text-xs text-gray-500">
                                  Total: {formatCurrency(
                                    invoice.payments?.reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0) || 0
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleInvoiceExpansion(invoice.id);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                    Details
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                    disabled={downloadingId === invoice.id}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        setDownloadingId(invoice.id);
                                        await downloadInvoicePDF(invoice.id);
                                        toast.success("Invoice downloaded successfully");
                                      } catch (err: any) {
                                        console.error(err);
                                        toast.error(err.message || "Failed to download invoice");
                                      } finally {
                                        setDownloadingId(null);
                                      }
                                    }}
                                  >
                                    {downloadingId === invoice.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            
                            {/* Expanded Details Row */}
                            {isExpanded && (
                              <tr className="bg-blue-50">
                                <td colSpan={7} className="px-6 py-4"> {/* Updated colSpan to 7 */}
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Invoice Items */}
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Invoice Items
                                      </h4>
                                      <div className="space-y-2">
                                        {invoice.invoiceItems?.length ? (
                                          invoice.invoiceItems.map((item: any) => (
                                            <div
                                              key={item.id}
                                              className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                                            >
                                              <div>
                                                <div className="font-medium text-gray-900">{item.description}</div>
                                                {item.notes && (
                                                  <div className="text-sm text-gray-500 mt-1">{item.notes}</div>
                                                )}
                                              </div>
                                              <span className="font-semibold text-gray-900">
                                                {formatCurrency(item.amount)}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-sm text-gray-500 italic p-3 bg-white rounded-lg border border-gray-200">
                                            No line items
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Payments */}
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Payment History
                                      </h4>
                                      <div className="space-y-2">
                                        {invoice.payments?.length ? (
                                          invoice.payments.map((payment: any) => (
                                            <div
                                              key={payment.id}
                                              className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
                                            >
                                              <div>
                                                <div className="font-medium text-gray-900 capitalize">
                                                  {payment.method} Payment
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                  {payment.reference && `Ref: ${payment.reference}`}
                                                  {payment.paymentDate && ` • ${formatDate(payment.paymentDate)}`}
                                                </div>
                                              </div>
                                              <span className="font-semibold text-green-600">
                                                {formatCurrency(payment.amount)}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-sm text-gray-500 italic p-3 bg-white rounded-lg border border-gray-200">
                                            No payments recorded
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}