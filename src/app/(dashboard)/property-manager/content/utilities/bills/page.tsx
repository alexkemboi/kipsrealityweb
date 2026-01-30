"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Plus, Eye, FileDown, Search, Lock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GenerateBillModal } from "./GenerateBillModal";
import { AddReadingModal } from "../[id]/readings/AddReadingModal";

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface Bill {
    id: string;
    propertyId: string;
    propertyName: string;
    utilityId: string | null;
    utilityType: string;
    providerName: string;
    totalAmount: number;
    consumption: number | null;
    rate: number | null;
    status: string;
    splitMethod: string;
    billDate: string;
    dueDate: string;
    periodStart: string | null;
    periodEnd: string | null;
    allocationCount: number;
    createdAt: string;
}

interface Reading {
    id: string;
    utilityName: string;
    unitNumber: string;
    propertyName: string;
    tenantName: string;
    readingValue: number;
    amount: number | null;
    readingDate: string | null;
}

interface Property {
    id: string;
    name: string;
}

export default function UtilityOperationsPage() {
    // ----------------------------------------------------------------------
    // STATE: BILLS
    // ----------------------------------------------------------------------
    const [bills, setBills] = useState<Bill[]>([]);
    const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters: Bills
    const [filterProperty, setFilterProperty] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterUtility, setFilterUtility] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Extract unique properties from bills for the dropdown
    const uniqueProperties = useMemo(() => {
        const propMap = new Map<string, Property>();
        bills.forEach(bill => {
            if (!propMap.has(bill.propertyId)) {
                propMap.set(bill.propertyId, { id: bill.propertyId, name: bill.propertyName });
            }
        });
        return Array.from(propMap.values());
    }, [bills]);

    // ----------------------------------------------------------------------
    // STATE: READINGS
    // ----------------------------------------------------------------------
    const [readings, setReadings] = useState<Reading[]>([]);
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);

    // Filters: Readings
    const [readingFilterProperty, setReadingFilterProperty] = useState("all");
    const [readingFilterUtility, setReadingFilterUtility] = useState("all");

    // Extract unique values for reading filters
    const uniqueReadingProperties = useMemo(() => {
        return Array.from(new Set(readings.map(r => r.propertyName)));
    }, [readings]);

    const uniqueReadingUtilities = useMemo(() => {
        return Array.from(new Set(readings.map(r => r.utilityName)));
    }, [readings]);

    // ----------------------------------------------------------------------
    // EFFECTS: LOAD DATA
    // ----------------------------------------------------------------------
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch bills
                const billsRes = await fetch("/api/utilities/bills");
                if (!billsRes.ok) throw new Error("Failed to fetch bills");
                const billsData = await billsRes.json();
                setBills(billsData.bills || []);

                // Fetch readings
                const readingsRes = await fetch("/api/utilities/readings");
                if (!readingsRes.ok) throw new Error("Failed to fetch readings");
                const readingsData = await readingsRes.json();
                setReadings(readingsData.readings || []);
            } catch (err) {
                console.error("Error loading data:", err);
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // ----------------------------------------------------------------------
    // EFFECTS: FILTER BILLS
    // ----------------------------------------------------------------------
    useEffect(() => {
        let result = bills;
        if (filterProperty !== "all") {
            result = result.filter(b => b.propertyId === filterProperty);
        }
        if (filterStatus !== "all") {
            result = result.filter(b => b.status === filterStatus);
        }
        if (filterUtility !== "all") {
            result = result.filter(b => b.utilityType === filterUtility);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(b =>
                b.id.toLowerCase().includes(query) ||
                b.propertyName.toLowerCase().includes(query) ||
                b.providerName.toLowerCase().includes(query) ||
                b.utilityType.toLowerCase().includes(query)
            );
        }
        setFilteredBills(result);
    }, [bills, filterProperty, filterStatus, filterUtility, searchQuery]);

    // ----------------------------------------------------------------------
    // COMPUTED: FILTERED READINGS
    // ----------------------------------------------------------------------
    const filteredReadings = readings.filter((r) => {
        if (readingFilterProperty !== "all" && r.propertyName !== readingFilterProperty) return false;
        if (readingFilterUtility !== "all" && r.utilityName !== readingFilterUtility) return false;
        return true;
    });

    // ----------------------------------------------------------------------
    // HANDLERS: BILLS
    // ----------------------------------------------------------------------
    const handleCreateBill = (generatedBill: {
        id: string;
        propertyId: string;
        propertyName: string;
        unitId: string;
        unitNumber: string;
        utilityType: string;
        consumption: number;
        rate: number;
        amountDue: number;
        status: string;
        createdAt: string;
    }) => {
        // Transform GeneratedBill to Bill format
        const newBill: Bill = {
            id: generatedBill.id,
            propertyId: generatedBill.propertyId,
            propertyName: generatedBill.propertyName,
            utilityId: null,
            utilityType: generatedBill.utilityType,
            providerName: generatedBill.utilityType, // Default to utility type as provider
            totalAmount: generatedBill.amountDue,
            consumption: generatedBill.consumption,
            rate: generatedBill.rate,
            status: generatedBill.status,
            splitMethod: "EQUAL",
            billDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            periodStart: null,
            periodEnd: null,
            allocationCount: 0,
            createdAt: generatedBill.createdAt,
        };
        setBills(prev => [newBill, ...prev]);
        toast.success("Bill Generated", {
            description: `Bill for ${newBill.propertyName} has been created successfully.`,
            duration: 4000,
        });
        setIsGenerateModalOpen(false);
    };

    const handleApprove = (id: string) => {
        setBills(prev => prev.map(b => b.id === id ? { ...b, status: "APPROVED" } : b));
        toast.success("Bill Approved", {
            description: `Bill ${id} has been successfully approved.`,
            duration: 3000,
        });
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const handleExportPDF = () => {
        if (filteredBills.length === 0) {
            toast.error("No Data to Export", {
                description: "There are no bills matching your current filters."
            });
            return;
        }

        const toastId = toast.loading("Generating PDF report...", {
            description: "Please wait while we prepare your document."
        });

        setTimeout(() => {
            try {
                const doc = new jsPDF();
                doc.setFontSize(20);
                doc.setTextColor(0, 59, 115);
                doc.text("RentFlow360", 14, 22);
                doc.setFontSize(12);
                doc.setTextColor(100);
                doc.text("Utility Bills Report", 14, 32);
                doc.setFontSize(10);
                doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 40);

                const tableColumn = ["Bill ID", "Property", "Utility", "Provider", "Amount", "Status"];
                const tableRows = filteredBills.map(bill => [
                    bill.id.slice(0, 12) + "...",
                    bill.propertyName,
                    bill.utilityType,
                    bill.providerName,
                    formatCurrency(bill.totalAmount),
                    bill.status
                ]);

                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: 50,
                    styles: { fontSize: 8, cellPadding: 3 },
                    headStyles: { fillColor: [0, 59, 115], textColor: [255, 255, 255], fontStyle: 'bold' },
                    alternateRowStyles: { fillColor: [248, 250, 252] },
                });

                doc.save(`bills_report_${new Date().toISOString().split('T')[0]}.pdf`);
                toast.dismiss(toastId);
                toast.success("Export Complete", { description: "Your PDF report has been downloaded." });
            } catch (error) {
                console.error("PDF Export failed", error);
                toast.dismiss(toastId);
                toast.error("Export Failed", { description: "An error occurred while generating the PDF." });
            }
        }, 500);
    };

    // ----------------------------------------------------------------------
    // HANDLERS: READINGS
    // ----------------------------------------------------------------------
    const handleResetReadingFilters = () => {
        setReadingFilterProperty("all");
        setReadingFilterUtility("all");
    };

    const handleAddReading = (newReading: Partial<Reading>) => {
        const reading: Reading = {
            id: `r-${Date.now()}`,
            propertyName: newReading.propertyName || "",
            unitNumber: newReading.unitNumber || "",
            tenantName: newReading.tenantName || "",
            utilityName: newReading.utilityName || "Water",
            readingValue: newReading.readingValue || 0,
            amount: null,
            readingDate: new Date().toISOString(),
        };
        setReadings(prev => [reading, ...prev]);
        setIsReadingModalOpen(false);
        toast.success("Reading Added", { description: "Meter reading has been recorded successfully." });
    };

    const handleExportReadingsCSV = () => {
        if (filteredReadings.length === 0) return;
        const headers = ["Date", "Property", "Unit", "Tenant", "Utility Type", "Reading"];
        const rows = filteredReadings.map(r => [
            r.readingDate ? new Date(r.readingDate).toLocaleDateString() : "",
            r.propertyName,
            r.unitNumber,
            r.tenantName,
            r.utilityName,
            r.readingValue
        ]);
        const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `utility_readings_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Export Complete", { description: "Readings CSV has been downloaded." });
    };

    return (
        <div className="space-y-12 pb-12">
            {/* --- PAGE HEADER --- */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Utility Operations</h1>
                <p className="text-slate-500 mt-2">
                    Utility readings and tenant billing management
                </p>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* --- SECTION 1: UTILITY BILLS --- */}
            <section className="space-y-6">
                <div className="flex items-end justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#003b73]">Utility Bills</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Property-level utility charges from providers.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            onClick={handleExportPDF}
                        >
                            <FileDown className="w-4 h-4 mr-2" />
                            Export PDF
                        </Button>
                        <Button
                            className="bg-[#003b73] hover:bg-[#002b5b] text-white"
                            onClick={() => setIsGenerateModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Generate Bill
                        </Button>
                    </div>
                </div>

                {/* Bills Filters */}
                <div className="flex items-center gap-3">
                    <Select value={filterProperty} onValueChange={setFilterProperty}>
                        <SelectTrigger className="w-[180px] bg-white border-slate-200">
                            <SelectValue placeholder="All Properties" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-lg">
                            <SelectItem value="all" className="hover:bg-slate-100 cursor-pointer">All Properties</SelectItem>
                            {uniqueProperties.map(p => (
                                <SelectItem key={p.id} value={p.id} className="hover:bg-slate-100 cursor-pointer">{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[160px] bg-white border-slate-200">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-lg">
                            <SelectItem value="all" className="hover:bg-slate-100 cursor-pointer">All Statuses</SelectItem>
                            <SelectItem value="DRAFT" className="hover:bg-slate-100 cursor-pointer">Draft</SelectItem>
                            <SelectItem value="PENDING" className="hover:bg-slate-100 cursor-pointer">Pending</SelectItem>
                            <SelectItem value="APPROVED" className="hover:bg-slate-100 cursor-pointer">Approved</SelectItem>
                            <SelectItem value="POSTED" className="hover:bg-slate-100 cursor-pointer">Posted</SelectItem>
                        </SelectContent>
                    </Select>

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

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search bills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[200px] pl-9 bg-white border-slate-200 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Bills Table */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-b border-slate-100">
                                <TableHead className="font-bold text-slate-700 pl-4 text-xs uppercase tracking-tight">Property</TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-tight">Utility</TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-tight">Provider</TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-tight">Period</TableHead>
                                <TableHead className="font-bold text-slate-900 text-left text-xs uppercase tracking-tight">Amount</TableHead>
                                <TableHead className="font-bold text-slate-700 text-center text-xs uppercase tracking-tight">Status</TableHead>
                                <TableHead className="font-bold text-slate-700 text-right pr-4 text-xs uppercase tracking-tight">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i} className="h-12">
                                        <TableCell colSpan={7}><Skeleton className="h-4 w-full bg-slate-100" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredBills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-400 italic text-sm">
                                        No billing records found matching current filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBills.map((bill) => {
                                    const periodStr = bill.periodStart && bill.periodEnd
                                        ? `${new Date(bill.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(bill.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                        : new Date(bill.billDate).toLocaleDateString();

                                    return (
                                        <TableRow key={bill.id} className="hover:bg-slate-50/50 border-b border-slate-50 transition-colors h-[52px] align-middle">
                                            <TableCell className="text-xs font-semibold text-slate-700 pl-4">{bill.propertyName}</TableCell>
                                            <TableCell>
                                                <div className={`text-[10px] font-bold uppercase tracking-wider inline-flex px-2 py-0.5 rounded-sm border
                                                ${bill.utilityType === 'Electricity' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        bill.utilityType === 'Water' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                    {bill.utilityType}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-600">{bill.providerName}</TableCell>
                                            <TableCell className="font-mono text-[11px] text-slate-500">{periodStr}</TableCell>
                                            <TableCell className="font-mono text-sm font-bold text-slate-900">
                                                {formatCurrency(bill.totalAmount)}
                                            </TableCell>
                                            <TableCell className="text-center p-0">
                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                ${bill.status === 'DRAFT' ? 'bg-slate-100 text-slate-500' :
                                                        bill.status === 'PENDING' ? 'bg-blue-50 text-blue-600' :
                                                            bill.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                                                'bg-purple-50 text-purple-600'}`}>
                                                    {bill.status}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {bill.status !== 'APPROVED' && bill.status !== 'POSTED' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-7 px-2.5 text-[10px] font-bold bg-[#30D5C8] hover:bg-[#2bc4b7] text-white shadow-sm border border-transparent rounded-[4px]"
                                                            onClick={() => handleApprove(bill.id)}
                                                        >
                                                            APPROVE
                                                        </Button>
                                                    )}
                                                    <Link href={`/property-manager/content/utilities/allocations?billId=${bill.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-[4px]">
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* --- SECTION 2: UTILITY READINGS --- */}
            <section className="space-y-6 pt-6">
                <div className="flex items-end justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#003b73]">Utility Readings</h2>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Immutable meter readings used to generate utility bills.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleExportReadingsCSV}
                            className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                        >
                            <Download className="w-4 h-4 mr-2 text-slate-500" />
                            Export CSV
                        </Button>
                        <Button
                            className="bg-[#003b73] hover:bg-[#002b5b] text-white shadow-sm"
                            onClick={() => setIsReadingModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Reading
                        </Button>
                    </div>
                </div>

                {/* Readings Filters */}
                <div className="flex items-center gap-3">
                    <Select value={readingFilterProperty} onValueChange={setReadingFilterProperty}>
                        <SelectTrigger className="w-[180px] bg-white border-slate-200">
                            <SelectValue placeholder="All Properties" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-lg">
                            <SelectItem value="all" className="hover:bg-slate-100 cursor-pointer">All Properties</SelectItem>
                            {uniqueReadingProperties.map(p => (
                                <SelectItem key={p} value={p} className="hover:bg-slate-100 cursor-pointer">{p}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={readingFilterUtility} onValueChange={setReadingFilterUtility}>
                        <SelectTrigger className="w-[160px] bg-white border-slate-200">
                            <SelectValue placeholder="All Utilities" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-lg">
                            <SelectItem value="all" className="hover:bg-slate-100 cursor-pointer">All Utilities</SelectItem>
                            {uniqueReadingUtilities.map(u => (
                                <SelectItem key={u} value={u} className="hover:bg-slate-100 cursor-pointer">{u}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(readingFilterProperty !== "all" || readingFilterUtility !== "all") && (
                        <Button variant="ghost" size="sm" onClick={handleResetReadingFilters} className="text-slate-500 hover:text-slate-900">
                            Reset
                        </Button>
                    )}
                </div>

                {/* Readings Table */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-b border-slate-100">
                                <TableHead className="w-[120px] font-bold text-slate-700 text-xs uppercase">Date</TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase">Property</TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase">Unit</TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase">Tenant</TableHead>
                                <TableHead className="font-bold text-slate-700 text-xs uppercase">Utility</TableHead>
                                <TableHead className="text-right pr-4 font-bold text-slate-700 text-xs uppercase">Reading</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReadings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500 text-sm italic">
                                        No readings found matching filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReadings.map((reading) => (
                                    <TableRow key={reading.id} className="hover:bg-slate-50/50 transition-colors h-[52px] align-middle">
                                        <TableCell className="font-medium text-slate-900 text-xs">
                                            {reading.readingDate ? new Date(reading.readingDate).toLocaleDateString() : "—"}
                                        </TableCell>
                                        <TableCell className="text-slate-700 text-xs">{reading.propertyName}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal border border-slate-200 text-[10px]">
                                                {reading.unitNumber}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-xs">{reading.tenantName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-medium text-[10px] uppercase tracking-wide
                                                ${reading.utilityName === 'Water' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                                                    reading.utilityName === 'Electricity' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                                                        'text-emerald-600 bg-emerald-50 border-emerald-200'}
                                            `}>
                                                {reading.utilityName}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-slate-700 pr-4 text-xs font-medium">
                                            {reading.readingValue.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* Modals */}
            <GenerateBillModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onGenerate={handleCreateBill}
            />

            <AddReadingModal
                isOpen={isReadingModalOpen}
                onClose={() => setIsReadingModalOpen(false)}
                onSuccess={handleAddReading}
                leaseUtilityId=""
                utilityId=""
                utilityName=""
                isGlobalAdd={true}
                properties={uniqueReadingProperties}
                units={[]}
            />
        </div>
    );
}
