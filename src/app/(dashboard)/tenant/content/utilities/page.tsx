"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Zap, Droplets, Flame, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface TenantBill {
  id: string;
  billId: string;
  utilityType: string;
  providerName: string;
  propertyName: string;
  unitNumber: string;
  amountDue: number;
  status: string;
  dueDate: string;
  billDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  isAllocated: boolean;
  percentage: number | null;
}

type UtilitiesApiResponse = { bills?: TenantBill[] } | TenantBill[];

function toValidDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeUtilityType(type?: string) {
  const t = (type || "").trim().toLowerCase();
  if (t === "electricity" || t === "electric") return "Electricity";
  if (t === "water") return "Water";
  if (t === "gas") return "Gas";
  return type || "Utility";
}

function normalizeStatus(status?: string) {
  return (status || "").trim().toUpperCase();
}

export default function TenantUtilitiesPage() {
  const [bills, setBills] = useState<TenantBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterUtility, setFilterUtility] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const loadBills = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/tenant/utilities", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch utility bills");

        const data: UtilitiesApiResponse = await response.json();
        const parsedBills = Array.isArray(data)
          ? data
          : Array.isArray(data?.bills)
          ? data.bills
          : [];

        if (!cancelled) {
          setBills(parsedBills);
        }
      } catch (err) {
        console.error("Error loading bills:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred");
          setBills([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadBills();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const utility = normalizeUtilityType(b.utilityType);
      const status = normalizeStatus(b.status);

      if (filterUtility !== "all" && utility !== filterUtility) return false;
      if (filterStatus !== "all" && status !== filterStatus) return false;

      return true;
    });
  }, [bills, filterUtility, filterStatus]);

  const getUtilityIcon = (type: string) => {
    switch (normalizeUtilityType(type)) {
      case "Electricity":
        return <Zap className="w-3.5 h-3.5" />;
      case "Water":
        return <Droplets className="w-3.5 h-3.5" />;
      case "Gas":
        return <Flame className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getUtilityStyles = (type: string) => {
    switch (normalizeUtilityType(type)) {
      case "Electricity":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Water":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Gas":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (normalizeStatus(status)) {
      case "PENDING":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "PAID":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "DRAFT":
        return "bg-slate-50 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatPeriod = (bill: TenantBill) => {
    const start = toValidDate(bill.periodStart);
    const end = toValidDate(bill.periodEnd);
    const billDate = toValidDate(bill.billDate);

    if (start && end) {
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
      })}`;
    }

    return billDate ? billDate.toLocaleDateString("en-US") : "N/A";
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      Number(amount ?? 0)
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">My Utility Bills</h1>
        <p className="text-sm text-slate-500">Monthly utility charges for your unit</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <Select value={filterUtility} onValueChange={setFilterUtility}>
          <SelectTrigger className="w-[160px] border-slate-200 bg-white">
            <SelectValue placeholder="All Utilities" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 bg-white shadow-lg">
            <SelectItem value="all" className="cursor-pointer hover:bg-slate-100">
              All Utilities
            </SelectItem>
            <SelectItem value="Electricity" className="cursor-pointer hover:bg-slate-100">
              Electricity
            </SelectItem>
            <SelectItem value="Water" className="cursor-pointer hover:bg-slate-100">
              Water
            </SelectItem>
            <SelectItem value="Gas" className="cursor-pointer hover:bg-slate-100">
              Gas
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] border-slate-200 bg-white">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 bg-white shadow-lg">
            <SelectItem value="all" className="cursor-pointer hover:bg-slate-100">
              All Statuses
            </SelectItem>
            <SelectItem value="PENDING" className="cursor-pointer hover:bg-slate-100">
              Pending
            </SelectItem>
            <SelectItem value="PAID" className="cursor-pointer hover:bg-slate-100">
              Paid
            </SelectItem>
            <SelectItem value="DRAFT" className="cursor-pointer hover:bg-slate-100">
              Draft
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="w-[140px] pl-5 text-xs font-bold uppercase tracking-tight text-slate-700">
                Utility Type
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-tight text-slate-700">
                Provider
              </TableHead>
              <TableHead className="w-[160px] text-xs font-bold uppercase tracking-tight text-slate-700">
                Period
              </TableHead>
              <TableHead className="w-[120px] border-l border-slate-100 pl-4 text-right text-xs font-bold uppercase tracking-tight text-slate-900">
                Amount
              </TableHead>
              <TableHead className="w-[100px] text-center text-xs font-bold uppercase tracking-tight text-slate-700">
                Status
              </TableHead>
              <TableHead className="w-[160px] pr-5 text-right text-xs font-bold uppercase tracking-tight text-slate-700">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i} className="h-14">
                  <TableCell colSpan={6}>
                    <Skeleton className="h-4 w-full bg-slate-100" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileText className="h-10 w-10 text-slate-300" />
                    <p className="text-sm text-slate-400">
                      No utility bills available for this period.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => {
                const utilityType = normalizeUtilityType(bill.utilityType);
                const status = normalizeStatus(bill.status);

                return (
                  <TableRow
                    key={bill.id}
                    className="h-[56px] border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                  >
                    <TableCell className="pl-5">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getUtilityStyles(
                          utilityType
                        )}`}
                      >
                        {getUtilityIcon(utilityType)}
                        {utilityType}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {bill.providerName || "N/A"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap font-mono text-xs text-slate-600">
                      {formatPeriod(bill)}
                    </TableCell>

                    <TableCell className="border-l border-slate-50 bg-slate-50/30 text-right font-mono text-sm font-bold text-slate-900">
                      {formatCurrency(bill.amountDue)}
                    </TableCell>

                    <TableCell className="text-center">
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusStyles(
                          status
                        )}`}
                      >
                        {status}
                      </div>
                    </TableCell>

                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <Link href={`/tenant/content/utilities/${bill.id}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View Bill
                          </Link>
                        </Button>

                        {status === "PENDING" && (
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 bg-[#003b73] px-3 text-xs font-semibold text-white hover:bg-[#002b5b]"
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
