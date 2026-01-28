"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Zap, Droplets, Flame } from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { Skeleton } from "@/components/ui/skeleton";

interface BillDetail {
    id: string;
    billId: string;
    utilityType: string;
    providerName: string;
    propertyName: string;
    unitNumber: string;
    tenantName: string;
    amountDue: number;
    status: string;
    dueDate: string;
    billDate: string;
    periodStart: string | null;
    periodEnd: string | null;
    percentage: number | null;
}

export default function BillDetailPage() {
    const params = useParams();
    const billId = params.billId as string;

    const [bill, setBill] = useState<BillDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBill = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch("/api/tenant/utilities");
                if (!response.ok) throw new Error("Failed to fetch bill details");

                const data = await response.json();
                const foundBill = data.bills?.find((b: BillDetail) => b.id === billId);

                if (foundBill) {
                    setBill(foundBill);
                } else {
                    setError("Bill not found");
                }
            } catch (err) {
                console.error("Error loading bill:", err);
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        loadBill();
    }, [billId]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "PAID":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const getUtilityIcon = (type: string) => {
        switch (type) {
            case "Electricity":
                return <Zap className="w-5 h-5" />;
            case "Water":
                return <Droplets className="w-5 h-5" />;
            case "Gas":
                return <Flame className="w-5 h-5" />;
            default:
                return null;
        }
    };

    const getUtilityStyles = (type: string) => {
        switch (type) {
            case "Electricity":
                return "bg-amber-100 text-amber-700";
            case "Water":
                return "bg-blue-100 text-blue-700";
            case "Gas":
                return "bg-emerald-100 text-emerald-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const handlePayNow = () => {
        alert("Payment integration coming soon!");
    };

    const handleDownloadInvoice = () => {
        if (!bill) return;

        const doc = new jsPDF();

        // 1. Header / Logo Area
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text("RentFlow360", 14, 25);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("Utility Bill Statement", 14, 32);

        // 2. Bill Info Grid
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("BILL TO", 14, 55);

        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(bill.tenantName || "Tenant", 14, 62);
        doc.text(`${bill.propertyName}, Unit ${bill.unitNumber}`, 14, 67);

        // Right Column
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("BILL DETAILS", 120, 55);

        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`Bill ID: ${bill.billId.slice(0, 12)}...`, 120, 62);
        doc.text(`Date Issued: ${new Date(bill.billDate).toLocaleDateString()}`, 120, 67);
        doc.text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`, 120, 72);
        doc.text(`Status: ${bill.status}`, 120, 77);

        // 3. Line Items
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 90, 196, 90);

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("DESCRIPTION", 14, 95);
        doc.text("AMOUNT", 196, 95, { align: 'right' });

        doc.line(14, 98, 196, 98);

        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);

        const period = bill.periodStart && bill.periodEnd
            ? `${new Date(bill.periodStart).toLocaleDateString()} - ${new Date(bill.periodEnd).toLocaleDateString()}`
            : new Date(bill.billDate).toLocaleDateString();

        doc.text(`${bill.utilityType} Charges (${period})`, 14, 108);
        doc.text(formatCurrency(bill.amountDue), 196, 108, { align: 'right' });

        if (bill.percentage) {
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(`(Allocated: ${bill.percentage}% of total bill)`, 14, 114);
        }

        doc.line(14, 120, 196, 120);

        // 6. Total
        doc.setFillColor(248, 250, 252);
        doc.rect(120, 130, 76, 25, 'F');

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("TOTAL DUE", 125, 140);
        doc.text(formatCurrency(bill.amountDue), 190, 147, { align: 'right' });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("Thank you for using RentFlow360", 105, 280, { align: 'center' });

        doc.save(`RentFlow360_Bill_${bill.id.slice(0, 8)}.pdf`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatPeriod = (bill: BillDetail) => {
        if (bill.periodStart && bill.periodEnd) {
            const start = new Date(bill.periodStart);
            const end = new Date(bill.periodEnd);
            return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}`;
        }
        return new Date(bill.billDate).toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (error || !bill) {
        return (
            <div className="space-y-6">
                <Link
                    href="/tenant/content/utilities"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Utility Bills
                </Link>
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error || "Bill not found"}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header + Actions Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <Link
                        href="/tenant/content/utilities"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to My Utility Bills
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getUtilityStyles(bill.utilityType)}`}>
                            {getUtilityIcon(bill.utilityType)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Utility Bill Details</h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Billing period: {formatPeriod(bill)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-end">
                    <Button
                        variant="outline"
                        onClick={handleDownloadInvoice}
                        className="h-10 px-4 text-sm font-medium border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                    </Button>
                    {bill.status === "PENDING" && (
                        <Button
                            onClick={handlePayNow}
                            className="h-10 px-6 text-sm font-semibold bg-[#003b73] hover:bg-[#002b5b] text-white shadow-md"
                        >
                            Pay Now
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Badge Row */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Payment Status:</span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyles(bill.status)}`}>
                        {bill.status}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total Amount Due</span>
                    <span className="text-xl font-bold text-slate-900">{formatCurrency(bill.amountDue)}</span>
                </div>
            </div>

            {/* Bill Summary Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Bill Summary</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Utility Type</p>
                            <p className="text-sm font-medium text-slate-900">{bill.utilityType}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Provider</p>
                            <p className="text-sm font-medium text-slate-900">{bill.providerName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Property</p>
                            <p className="text-sm font-medium text-slate-900">{bill.propertyName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Unit</p>
                            <p className="text-sm font-medium text-slate-900">{bill.unitNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Billing Period</p>
                            <p className="text-sm font-medium text-slate-900">{formatPeriod(bill)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Due Date</p>
                            <p className="text-sm font-medium text-slate-900">{formatDate(bill.dueDate)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Allocation Card (Conditional) */}
            {bill.percentage && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Allocation Details</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Allocation Method</p>
                                <p className="text-sm font-medium text-slate-900">Cost Allocation</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Your Share</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {bill.percentage}% of total bill
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Allocated Amount</p>
                                <p className="text-sm font-semibold text-slate-900">{formatCurrency(bill.amountDue)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Note */}
            {!bill.percentage && (
                <p className="text-sm text-slate-400 text-center py-2">
                    This bill applies only to your unit.
                </p>
            )}
        </div>
    );
}
