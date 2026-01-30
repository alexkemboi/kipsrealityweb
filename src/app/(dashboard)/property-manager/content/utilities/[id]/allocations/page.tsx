"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertCircle, PieChart, ArrowLeft, Lock, Info } from "lucide-react";
import Link from "next/link";
import { UtilityStatusBadge } from "../../components/UtilityStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Allocation {
    id: string;
    unitNumber: string;
    tenantName: string;
    amount: number;
    percentage: number;
    basis: string;
}

interface BillWithAllocations {
    id: string;
    providerName: string;
    totalAmount: number;
    status: string;
    splitMethod: string;
    allocations: Allocation[];
}

interface UtilityBill {
    id: string;
    providerName: string;
    billDate: string;
    status: string;
}

export default function AllocationsPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const utilityId = id as string;
    const preselectedBillId = searchParams.get("billId");

    const [bills, setBills] = useState<UtilityBill[]>([]);
    const [selectedBillId, setSelectedBillId] = useState<string>(preselectedBillId || "");
    const [billData, setBillData] = useState<BillWithAllocations | null>(null);
    const [utilityName, setUtilityName] = useState<string>("Utility");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAllocations, setIsLoadingAllocations] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, [utilityId]);

    useEffect(() => {
        if (selectedBillId) {
            loadAllocations(selectedBillId);
        } else {
            setBillData(null);
        }
    }, [selectedBillId]);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);

            const [utilRes, billsRes] = await Promise.all([
                fetch(`/api/utilities/${utilityId}`),
                fetch(`/api/utilities/${utilityId}/bills`),
            ]);

            const utilData = await utilRes.json();
            const billsData = await billsRes.json();

            const utilityData = utilData?.data || utilData;
            if (utilityData) {
                setUtilityName(utilityData.name || "Utility");
            }

            if (billsData.success) {
                const billsWithAllocations = (billsData.data || []).filter(
                    (b: UtilityBill) => b.status !== "DRAFT"
                );
                setBills(billsWithAllocations);

                if (preselectedBillId && billsWithAllocations.some((b: UtilityBill) => b.id === preselectedBillId)) {
                    setSelectedBillId(preselectedBillId);
                } else if (billsWithAllocations.length > 0 && !selectedBillId) {
                    setSelectedBillId(billsWithAllocations[0].id);
                }
            }
        } catch (err) {
            console.error("Load initial data error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllocations = async (billId: string) => {
        try {
            setIsLoadingAllocations(true);

            const res = await fetch(`/api/utilities/bills/${billId}/allocations`);
            const data = await res.json();

            if (data.success) {
                setBillData(data.data);
            } else {
                setBillData(null);
            }
        } catch (err) {
            console.error("Load allocations error:", err);
            setBillData(null);
        } finally {
            setIsLoadingAllocations(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatAllocationBasis = (method: string) => {
        const labels: Record<string, string> = {
            EQUAL: "Equal Usage",
            OCCUPANCY_BASED: "Occupancy-based",
            SQ_FOOTAGE: "Square Footage",
            SUB_METERED: "Sub-metered",
            CUSTOM_RATIO: "Custom Ratio",
            AI_OPTIMIZED: "AI Optimized",
        };
        return labels[method] ?? method;
    };

    const allocations = billData?.allocations ?? [];

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href={`/property-manager/content/utilities/${utilityId}`}>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 px-0 -ml-2 mb-1 h-auto py-1">
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                            </Button>
                        </Link>
                        <h2 className="text-2xl font-bold text-[#0b1f3a] tracking-tight">Bill Allocations</h2>
                        <p className="text-slate-500 text-sm">View how costs are distributed for {utilityName}</p>
                    </div>

                    {bills.length > 0 && (
                        <div className="w-full md:w-[300px]">
                            <Select value={selectedBillId} onValueChange={setSelectedBillId}>
                                <SelectTrigger className="bg-white border-slate-200">
                                    <SelectValue placeholder="Select a bill" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bills.map((bill) => (
                                        <SelectItem key={bill.id} value={bill.id}>
                                            {bill.providerName} - {formatDate(bill.billDate)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Read-Only Notice */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
                    <div className="bg-slate-100 p-1.5 rounded-full mt-0.5">
                        <Lock className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-800">Read-Only View</h4>
                        <p className="text-sm text-slate-600 mt-0.5">
                            Allocations are calculated by the system and cannot be edited. This view is for transparency and audit purposes.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : bills.length === 0 ? (
                            <div className="text-center py-20 space-y-4">
                                <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                    <PieChart className="w-8 h-8 text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-[#0b1f3a]">No bills with allocations</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-1">
                                        Allocations appear after a bill is processed from DRAFT status.
                                    </p>
                                </div>
                            </div>
                        ) : !selectedBillId ? (
                            <div className="text-center py-20 space-y-4">
                                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                                    <Info className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-[#0b1f3a]">Select a bill</h3>
                                    <p className="text-slate-500">Use the dropdown above to view allocations</p>
                                </div>
                            </div>
                        ) : isLoadingAllocations ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        ) : allocations.length === 0 ? (
                            <div className="text-center py-20 space-y-4">
                                <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-[#0b1f3a]">No allocations found</h3>
                                    <p className="text-slate-500">This bill may not have been allocated yet</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Bill Summary */}
                                {billData && (
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Provider</p>
                                                <p className="font-semibold text-[#0b1f3a]">{billData.providerName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                                                <p className="font-semibold text-[#0b1f3a]">{formatCurrency(billData.totalAmount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Split Method</p>
                                                <Badge variant="outline" className="bg-white border-slate-200">
                                                    {formatAllocationBasis(billData.splitMethod)}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                                                <UtilityStatusBadge status={billData.status} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Allocations Table */}
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-b border-slate-100 hover:bg-transparent">
                                            <TableHead className="font-semibold text-[#0b1f3a] pl-6">Unit</TableHead>
                                            <TableHead className="font-semibold text-[#0b1f3a]">Tenant</TableHead>
                                            <TableHead className="font-semibold text-[#0b1f3a]">Amount</TableHead>
                                            <TableHead className="font-semibold text-[#0b1f3a]">Percentage</TableHead>
                                            <TableHead className="font-semibold text-[#0b1f3a] pr-6">Basis</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allocations.map((allocation, index) => (
                                            <TableRow
                                                key={allocation.id}
                                                className={`hover:bg-blue-50/30 border-b border-slate-50 last:border-0 ${index % 2 === 1 ? 'bg-slate-25' : ''}`}
                                            >
                                                <TableCell className="font-medium text-[#0b1f3a] pl-6">
                                                    Unit {allocation.unitNumber}
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    {allocation.tenantName}
                                                </TableCell>
                                                <TableCell className="font-mono text-[#0b1f3a]">
                                                    {formatCurrency(allocation.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                                        {allocation.percentage.toFixed(1)}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm pr-6">
                                                    {allocation.basis}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Total Row */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                    <span className="font-semibold text-[#0b1f3a]">Total Allocated</span>
                                    <span className="font-bold text-lg text-[#0b1f3a]">
                                        {formatCurrency(allocations.reduce((sum, a) => sum + a.amount, 0))}
                                    </span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
