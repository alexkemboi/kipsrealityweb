"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, ArrowLeft, Info, Calendar } from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";
import { UtilityStatusBadge } from "../../components/UtilityStatusBadge";
import { CreateBillModal } from "./CreateBillModal";
import { BillActions } from "./BillActions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Bill {
    id: string;
    providerName: string;
    billDate: string;
    dueDate: string;
    totalAmount: number;
    splitMethod: string;
    status: string;
}

export default function BillsPage() {
    const { id } = useParams();
    const utilityId = id as string;

    const [bills, setBills] = useState<Bill[]>([]);
    const [utilityName, setUtilityName] = useState<string>("Utility");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [utilityId]);

    const loadData = async () => {
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
                setBills(billsData.data || []);
            }
        } catch (err) {
            console.error("Load bills error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBillCreated = () => {
        loadData();
    };

    const handleActionComplete = () => {
        loadData();
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

    const formatSplitMethod = (method: string) => {
        const labels: Record<string, string> = {
            EQUAL: "Equal Usage",
            OCCUPANCY_BASED: "Occupancy-based",
            SQ_FOOTAGE: "Sq. Footage",
            SUB_METERED: "Sub-metered",
            CUSTOM_RATIO: "Custom Ratio",
            AI_OPTIMIZED: "AI Optimized",
        };
        return labels[method] ?? method;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <Toaster position="top-right" richColors />
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href={`/property-manager/content/utilities/${utilityId}`}>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 px-0 -ml-2 mb-1 h-auto py-1">
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                            </Button>
                        </Link>
                        <h2 className="text-2xl font-bold text-[#0b1f3a] tracking-tight">Provider Bills</h2>
                        <p className="text-slate-500 text-sm">Manage bills and payment status for {utilityName}</p>
                    </div>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#30D5C8] hover:bg-[#2bcbbe] text-white shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Bill
                    </Button>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 flex gap-3 shadow-sm">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-blue-900">Workflow</h4>
                        <p className="text-sm text-blue-800/80 leading-relaxed">
                            Bills progress through: <Badge variant="secondary" className="bg-slate-200 text-slate-700 mx-1 border-0">DRAFT</Badge>
                            → <Badge variant="secondary" className="bg-blue-200 text-blue-800 mx-1 border-0">PROCESSING</Badge>
                            → <Badge variant="secondary" className="bg-green-200 text-green-800 mx-1 border-0">APPROVED</Badge>
                            → <Badge variant="secondary" className="bg-purple-200 text-purple-800 mx-1 border-0">POSTED</Badge>.
                            Create a bill to start the process.
                        </p>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-12 w-full rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : bills.length === 0 ? (
                            <div className="text-center py-20 space-y-4">
                                <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                    <FileText className="w-8 h-8 text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-[#0b1f3a]">No bills recorded</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                                        Create your first bill to track costs and allocate expenses to tenants.
                                    </p>
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        variant="outline"
                                        className="border-slate-200"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create First Bill
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                                        <TableHead className="font-semibold text-[#0b1f3a] pl-6">Provider</TableHead>
                                        <TableHead className="font-semibold text-[#0b1f3a]">Dates</TableHead>
                                        <TableHead className="font-semibold text-[#0b1f3a]">Amount</TableHead>
                                        <TableHead className="font-semibold text-[#0b1f3a]">Allocation</TableHead>
                                        <TableHead className="font-semibold text-[#0b1f3a]">Status</TableHead>
                                        <TableHead className="font-semibold text-[#0b1f3a] text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bills.map((bill) => (
                                        <TableRow key={bill.id} className="hover:bg-blue-50/30 border-b border-slate-50 last:border-0 group">
                                            <TableCell className="font-medium text-[#0b1f3a] pl-6 py-4">
                                                {bill.providerName}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="text-slate-700 flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-slate-400" /> {formatDate(bill.billDate)}
                                                    </span>
                                                    <span className="text-slate-400 text-xs mt-0.5">
                                                        Due: {formatDate(bill.dueDate)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-[#0b1f3a]">
                                                {formatCurrency(bill.totalAmount)}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                <Badge variant="outline" className="font-normal bg-slate-50 text-slate-600 border-slate-200">
                                                    {formatSplitMethod(bill.splitMethod)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <UtilityStatusBadge status={bill.status} />
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <BillActions
                                                    billId={bill.id}
                                                    billStatus={bill.status}
                                                    utilityId={utilityId}
                                                    onActionComplete={handleActionComplete}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CreateBillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleBillCreated}
                utilityId={utilityId}
                utilityName={utilityName}
            />
        </div>
    );
}
