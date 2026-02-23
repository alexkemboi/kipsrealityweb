"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { fetchInvoicesForTenant, downloadInvoicePDF } from "@/lib/Invoice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ID = string | number;

type Payment = {
  id: ID;
  amount?: number | null;
  method?: string | null;
  reference?: string | null;
};

type InvoiceItem = {
  id: ID;
  description?: string | null;
  amount?: number | null;
};

type Invoice = {
  id: ID;
  type?: string | null;
  status?: string | null;
  amount?: number | null;
  dueDate?: string | null;
  invoiceItems?: InvoiceItem[] | null;
  payments?: Payment[] | null;
};

type InvoiceGroup = {
  date: string; // YYYY-MM-DD or "no-date"
  items: Invoice[];
};

function safeDateKey(dateValue?: string | null): string {
  if (!dateValue) return "no-date";

  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "no-date";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function groupInvoicesByDueDate(invoices: Invoice[]): InvoiceGroup[] {
  const map: Record<string, Invoice[]> = {};

  for (const inv of invoices) {
    const key = safeDateKey(inv.dueDate);
    if (!map[key]) map[key] = [];
    map[key].push(inv);
  }

  return Object.entries(map)
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => {
      if (a.date === "no-date") return 1;
      if (b.date === "no-date") return -1;
      return a.date < b.date ? 1 : -1;
    });
}

function getStatusColor(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-50 text-green-800 border-green-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatCurrency(amount?: number | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));
}

function formatDate(dateString: string) {
  if (dateString === "no-date") return "No Due Date";

  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Invalid Date";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function TenantInvoicesPage() {
  const params = useParams();

  const rawTenantId = (params as Record<string, string | string[] | undefined>)?.tenantId;
  const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<ID | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchInvoicesForTenant(tenantId);
        if (!cancelled) {
          setInvoices(Array.isArray(data) ? (data as Invoice[]) : []);
        }
      } catch (err: unknown) {
        console.error(err);
        if (!cancelled) {
          toast.error(getErrorMessage(err, "Failed to load invoices"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const grouped = useMemo(() => groupInvoicesByDueDate(invoices), [invoices]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="mb-8 h-10 w-64 bg-gray-300" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white">
                <CardHeader>
                  <Skeleton className="h-6 w-48 bg-gray-300" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="space-y-4 rounded-lg border-2 border-gray-200 bg-white p-4"
                      >
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

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-2 border-red-200 bg-white py-12 text-center">
            <CardContent>
              <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Missing tenant ID</h3>
              <p className="text-gray-600">
                Unable to load invoices because the tenant ID is not available.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Tenant Billing</h1>
            <p className="text-gray-600">View and manage all your invoices and payments</p>
          </div>

          {invoices.length > 0 && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm sm:mt-0">
              <div className="text-sm text-gray-600">Total Invoices</div>
              <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
            </div>
          )}
        </div>

        {grouped.length === 0 ? (
          <Card className="py-12 text-center border-2 border-gray-200">
            <CardContent>
              <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No invoices found</h3>
              <p className="text-gray-600">There are no invoices available for this tenant.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => {
              const totalBilled = group.items.reduce(
                (sum, inv) => sum + Number(inv.amount ?? 0),
                0
              );

              const totalPaid = group.items.reduce((sum, inv) => {
                const paymentTotal = (inv.payments ?? []).reduce(
                  (ps, p) => ps + Number(p.amount ?? 0),
                  0
                );
                return sum + paymentTotal;
              }, 0);

              const balance = totalBilled - totalPaid;

              return (
                <Card
                  key={group.date}
                  className="border-2 border-gray-200 bg-white shadow-sm"
                >
                  <CardHeader className="border-b-2 border-gray-200 bg-gray-50">
                    <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
                      <div className="mb-3 flex items-center gap-3 sm:mb-0">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-lg">Billing Period</CardTitle>
                          <p className="font-medium text-gray-600">{formatDate(group.date)}</p>
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
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((invoice, index) => (
                        <Card
                          key={String(invoice.id)}
                          className="relative overflow-hidden border-2 border-gray-300 bg-white transition-all duration-200 hover:shadow-lg"
                        >
                          {index > 0 && (
                            <div className="absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                          )}

                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium uppercase text-gray-700">
                                    {invoice.type ?? "General"} Invoice
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(invoice.amount)}
                                </div>
                              </div>

                              <Badge
                                variant="outline"
                                className={`${getStatusColor(invoice.status)} border-2 font-medium`}
                              >
                                {invoice.status ?? "Unknown"}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div>
                              <div className="mb-2 flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Items</span>
                              </div>

                              <div className="space-y-2">
                                {(invoice.invoiceItems ?? []).length > 0 ? (
                                  (invoice.invoiceItems ?? []).map((item) => (
                                    <div
                                      key={String(item.id)}
                                      className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 p-2 text-sm"
                                    >
                                      <span className="mr-2 flex-1 truncate text-gray-600">
                                        {item.description ?? "Item"}
                                      </span>
                                      <span className="whitespace-nowrap font-medium text-gray-900">
                                        {formatCurrency(item.amount)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="rounded border border-gray-100 bg-gray-50 p-2 text-sm italic text-gray-400">
                                    No line items
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="mb-2 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Payments</span>
                              </div>

                              <div className="space-y-2">
                                {(invoice.payments ?? []).length > 0 ? (
                                  (invoice.payments ?? []).map((payment) => (
                                    <div
                                      key={String(payment.id)}
                                      className="flex items-center justify-between rounded border border-green-100 bg-green-50 p-2 text-sm"
                                    >
                                      <div className="mr-2 flex-1">
                                        <span className="capitalize text-gray-600">
                                          {payment.method ?? "payment"}
                                        </span>
                                        {payment.reference && (
                                          <span className="ml-1 text-xs text-gray-400">
                                            ({payment.reference})
                                          </span>
                                        )}
                                      </div>
                                      <span className="whitespace-nowrap font-medium text-green-700">
                                        {formatCurrency(payment.amount)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="rounded border border-gray-100 bg-gray-50 p-2 text-sm italic text-gray-400">
                                    No payments
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              className="mt-4 w-full border-2 border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700"
                              disabled={downloadingId === invoice.id}
                              onClick={async () => {
                                try {
                                  setDownloadingId(invoice.id);
                                  await downloadInvoicePDF(invoice.id);
                                  toast.success("Invoice downloaded successfully");
                                } catch (err: unknown) {
                                  console.error(err);
                                  toast.error(getErrorMessage(err, "Failed to download invoice"));
                                } finally {
                                  setDownloadingId(null);
                                }
                              }}
                            >
                              {downloadingId === invoice.id ? (
                                <>
                                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="border-2 border-gray-300 bg-gray-50">
                      <CardContent className="p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                          <AlertCircle className="h-5 w-5 text-gray-600" />
                          Billing Summary
                        </h4>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          <div className="rounded-lg border-2 border-gray-200 bg-white p-4 text-center">
                            <div className="mb-1 text-sm text-gray-600">Total Billed</div>
                            <div className="text-2xl font-bold text-gray-900">
                              {formatCurrency(totalBilled)}
                            </div>
                          </div>

                          <div className="rounded-lg border-2 border-gray-200 bg-white p-4 text-center">
                            <div className="mb-1 text-sm text-gray-600">Total Paid</div>
                            <div className="text-2xl font-bold text-green-700">
                              {formatCurrency(totalPaid)}
                            </div>
                          </div>

                          <div className="rounded-lg border-2 border-gray-200 bg-white p-4 text-center">
                            <div className="mb-1 text-sm text-gray-600">Balance</div>
                            <div
                              className={`text-2xl font-bold ${
                                balance > 0 ? "text-red-600" : "text-green-700"
                              }`}
                            >
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
