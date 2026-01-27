"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { fetchInvoicesForTenant, downloadInvoicePDF } from "@/lib/Invoice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, DollarSign, CreditCard, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function groupInvoicesByDueDate(invoices: any[]) {
  const map: Record<string, any[]> = {};
  invoices.forEach((inv) => {
    const key = inv.dueDate
      ? new Date(inv.dueDate).toISOString().slice(0, 10)
      : "no-date";
    if (!map[key]) map[key] = [];
    map[key].push(inv);
  });

  return Object.entries(map)
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-navy-100 text-green-800 border-navy-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatCurrency(amount: number) {
  return `$ ${Number(amount).toLocaleString()}`;
}

function formatDate(dateString: string) {
  if (dateString === "no-date") return "No Due Date";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export default function TenantInvoicesPage() {
  const params = useParams();
  const tenantId = (params as any).tenantId;

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8 bg-gray-300" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white">
                <CardHeader>
                  <Skeleton className="h-6 w-48 bg-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="space-y-4 p-4 border-2 border-gray-200 rounded-lg bg-white">
                        <Skeleton className="h-6 w-32 bg-gray-300" />
                        <Skeleton className="h-8 w-24 bg-gray-300" />
                        <Skeleton className="h-4 w-full bg-gray-300" />
                        <Skeleton className="h-4 w-3/4 bg-gray-300" />
                        <Skeleton className="h-10 w-full bg-gray-300" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Tenant Billing</h1>
            <p className="text-gray-600">View and manage all your invoices and payments</p>
          </div>
          {invoices.length > 0 && (
            <div className="mt-4 sm:mt-0 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total Invoices</div>
              <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
            </div>
          )}
        </div>

        {grouped.length === 0 ? (
          <Card className="text-center py-12 border-2 border-gray-200">
            <CardContent>
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600">There are no invoices available for this tenant.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => {
              const totalBilled = group.items.reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
              const totalPaid = group.items.reduce(
                (sum, inv) => sum + (inv.payments || []).reduce((ps: number, p: any) => ps + (p.amount ?? 0), 0),
                0
              );
              const balance = totalBilled - totalPaid;

              return (
                <Card key={group.date} className="shadow-sm border-2 border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50 border-b-2 border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-lg">Billing Period</CardTitle>
                          <p className="text-gray-600 font-medium">{formatDate(group.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Due</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(totalBilled)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Invoice Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {group.items.map((invoice, index) => (
                        <Card
                          key={invoice.id}
                          className="hover:shadow-lg transition-all duration-200 border-2 border-gray-300 bg-white relative overflow-hidden"
                        >
                          {/* Subtle separator effect */}
                          {index > 0 && (
                            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                          )}

                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-700 uppercase">
                                    {invoice.type} Invoice
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(invoice.amount)}
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(invoice.status)} font-medium border-2`}
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Invoice Items */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Items</span>
                              </div>
                              <div className="space-y-2">
                                {invoice.invoiceItems?.length ? (
                                  invoice.invoiceItems.map((item: any) => (
                                    <div
                                      key={item.id}
                                      className="flex justify-between items-center text-sm p-2 rounded bg-gray-50 border border-gray-100"
                                    >
                                      <span className="text-gray-600 truncate flex-1 mr-2">
                                        {item.description}
                                      </span>
                                      <span className="font-medium text-gray-900 whitespace-nowrap">
                                        {formatCurrency(item.amount)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-gray-400 italic p-2 bg-gray-50 rounded border border-gray-100">
                                    No line items
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Payments */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Payments</span>
                              </div>
                              <div className="space-y-2">
                                {invoice.payments?.length ? (
                                  invoice.payments.map((payment: any) => (
                                    <div
                                      key={payment.id}
                                      className="flex justify-between items-center text-sm p-2 rounded bg-navy-50 border border-green-100"
                                    >
                                      <div className="flex-1 mr-2">
                                        <span className="text-gray-600 capitalize">{payment.method}</span>
                                        {payment.reference && (
                                          <span className="text-gray-400 text-xs ml-1">
                                            ({payment.reference})
                                          </span>
                                        )}
                                      </div>
                                      <span className="font-medium text-navy-700 whitespace-nowrap">
                                        {formatCurrency(payment.amount)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-gray-400 italic p-2 bg-gray-50 rounded border border-gray-100">
                                    No payments
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Download Button - Blue */}
                            <Button
                              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700"
                              disabled={downloadingId === invoice.id}
                              onClick={async () => {
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
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Summary Section */}
                    <Card className="bg-gray-50 border-2 border-gray-300">
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-gray-600" />
                          Billing Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center p-4 bg-white rounded-lg border-2 border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Total Billed</div>
                            <div className="text-2xl font-bold text-gray-900">
                              {formatCurrency(totalBilled)}
                            </div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border-2 border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Total Paid</div>
                            <div className="text-2xl font-bold text-navy-700">
                              {formatCurrency(totalPaid)}
                            </div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border-2 border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Balance</div>
                            <div className={`text-2xl font-bold ${balance > 0 ? "text-red-600" : "text-navy-700"
                              }`}>
                              {formatCurrency(balance)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}