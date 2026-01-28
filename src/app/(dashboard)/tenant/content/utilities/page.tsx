"use client";

import { useEffect, useState } from "react";
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

export default function TenantUtilitiesPage() {
    const [bills, setBills] = useState<TenantBill[]>([]);
    const [filteredBills, setFilteredBills] = useState<TenantBill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterUtility, setFilterUtility] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const loadBills = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch("/api/tenant/utilities");
                if (!response.ok) throw new Error("Failed to fetch utility bills");

                const data = await response.json();
                setBills(data.bills || []);
            } catch (err) {
                console.error("Error loading bills:", err);
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        loadBills();
    }, []);

    useEffect(() => {
        let result = bills;
        if (filterUtility !== "all") {
            result = result.filter(b => b.utilityType === filterUtility);
        }
        if (filterStatus !== "all") {
            result = result.filter(b => b.status === filterStatus);
        }
        setFilteredBills(result);
    }, [bills, filterUtility, filterStatus]);

    const getUtilityIcon = (type: string) => {
        switch (type) {
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
        switch (type) {
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
        switch (status) {
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
        if (bill.periodStart && bill.periodEnd) {
            const start = new Date(bill.periodStart);
            const end = new Date(bill.periodEnd);
            return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}`;
        }
        return new Date(bill.billDate).toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900">My Utility Bills</h1>
                <p className="text-sm text-slate-500">Monthly utility charges for your unit</p>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <Select value={filterUtility} onValueChange={setFilterUtility}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200">
                        <SelectValue placeholder="All Utilities" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-lg">
                        <SelectItem value="all" className="hover:bg-slate-100 cursor-pointer">All Utilities</SelectItem>
                        <SelectItem value="Electricity" className="hover:bg-slate-100 cursor-pointer">Electricity</SelectItem>
                        <SelectItem value="Water" className="hover:bg-slate-100 cursor-pointer">Water</SelectItem>
                        <SelectItem value="Gas" className="hover:bg-slate-100 cursor-pointer">Gas</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-lg">
                        <SelectItem value="all" className="hover:bg-slate-100 cursor-pointer">All Statuses</SelectItem>
                        <SelectItem value="PENDING" className="hover:bg-slate-100 cursor-pointer">Pending</SelectItem>
                        <SelectItem value="PAID" className="hover:bg-slate-100 cursor-pointer">Paid</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-b border-slate-100">
                            <TableHead className="font-bold text-slate-700 pl-5 w-[140px] text-xs uppercase tracking-tight">Utility Type</TableHead>
                            <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-tight">Provider</TableHead>
                            <TableHead className="font-bold text-slate-700 w-[160px] text-xs uppercase tracking-tight">Period</TableHead>
                            <TableHead className="font-bold text-slate-900 text-right w-[120px] text-xs uppercase tracking-tight border-l border-slate-100 pl-4">Amount</TableHead>
                            <TableHead className="font-bold text-slate-700 text-center w-[100px] text-xs uppercase tracking-tight">Status</TableHead>
                            <TableHead className="font-bold text-slate-700 text-right pr-5 w-[160px] text-xs uppercase tracking-tight">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(4)].map((_, i) => (
                                <TableRow key={i} className="h-14">
                                    <TableCell colSpan={6}><Skeleton className="h-4 w-full bg-slate-100" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredBills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FileText className="w-10 h-10 text-slate-300" />
                                        <p className="text-slate-400 text-sm">No utility bills available for this period.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBills.map((bill) => (
                                <TableRow key={bill.id} className="hover:bg-slate-50/50 border-b border-slate-50 transition-colors h-[56px]">
                                    <TableCell className="pl-5">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${getUtilityStyles(bill.utilityType)}`}>
                                            {getUtilityIcon(bill.utilityType)}
                                            {bill.utilityType}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600">{bill.providerName}</TableCell>
                                    <TableCell className="font-mono text-xs text-slate-600 whitespace-nowrap">
                                        {formatPeriod(bill)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm font-bold text-slate-900 border-l border-slate-50 bg-slate-50/30">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bill.amountDue)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyles(bill.status)}`}>
                                            {bill.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/tenant/content/utilities/${bill.id}`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 px-3 text-xs font-medium border-slate-200 hover:bg-slate-50 text-slate-600"
                                                >
                                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                    View Bill
                                                </Button>
                                            </Link>
                                            {bill.status === "PENDING" && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 px-3 text-xs font-semibold bg-[#003b73] hover:bg-[#002b5b] text-white"
                                                >
                                                    Pay Now
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
