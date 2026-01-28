"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Search, Download, FileText, Droplets, Zap, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

interface AllocationRow {
    id: string;
    unit: string;
    tenant: string;
    utility: string;
    provider: string;
    period: string; // Formatted DD/MM/YY – DD/MM/YY
    periodRaw: Date; // For sorting/filtering
    amount: number;
    basis: string;
    property: string;
    propertyId: string;
}

// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export default function AllocationsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [allAllocations, setAllAllocations] = useState<AllocationRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterProperty, setFilterProperty] = useState("all");
    const [filterProvider, setFilterProvider] = useState("all");
    const [filterUtility, setFilterUtility] = useState("all");
    const [filterPeriod, setFilterPeriod] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Load data from API
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/utilities/allocations");

                if (!response.ok) {
                    throw new Error("Failed to fetch allocations");
                }

                const data = await response.json();

                // Transform API response to AllocationRow format
                const rows: AllocationRow[] = data.allocations.map((alloc: {
                    id: string;
                    unit: string;
                    tenant: string;
                    utility: string;
                    provider: string;
                    period: string;
                    periodRaw: string;
                    amount: number;
                    basis: string;
                    property: string;
                    propertyId: string;
                }) => ({
                    ...alloc,
                    periodRaw: new Date(alloc.periodRaw),
                }));

                // Sort by date (newest first) then unit
                rows.sort((a, b) => {
                    return b.periodRaw.getTime() - a.periodRaw.getTime() || a.unit.localeCompare(b.unit);
                });

                setAllAllocations(rows);
            } catch (err) {
                console.error("Error loading allocations:", err);
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Derived State: Filtered Allocations
    const filteredAllocations = useMemo(() => {
        return allAllocations.filter(row => {
            const matchesProperty = filterProperty === "all" || row.propertyId === filterProperty;
            const matchesProvider = filterProvider === "all" || row.provider === filterProvider;
            const matchesUtility = filterUtility === "all" || row.utility === filterUtility;

            // Period filter logic (grouping by Month Year)
            const rowPeriodLabel = row.periodRaw.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            const matchesPeriod = filterPeriod === "all" || rowPeriodLabel === filterPeriod;

            const matchesSearch = searchQuery === "" ||
                row.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                row.unit.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesProperty && matchesProvider && matchesUtility && matchesPeriod && matchesSearch;
        });
    }, [allAllocations, filterProperty, filterProvider, filterUtility, filterPeriod, searchQuery]);

    // Derived State: Summary Metrics
    const summary = useMemo(() => {
        const totalAmount = filteredAllocations.reduce((sum, row) => sum + row.amount, 0);
        const uniqueTenants = new Set(filteredAllocations.map(r => r.tenant)).size;

        // Determine display strings for summary
        const displayedUtility = filterUtility !== "all" ? filterUtility : "All Utilities";
        const displayedPeriod = filterPeriod !== "all" ? filterPeriod : "All Periods";

        return {
            totalAmount,
            tenantCount: uniqueTenants,
            utilityType: displayedUtility,
            period: displayedPeriod
        };
    }, [filteredAllocations, filterUtility, filterPeriod]);

    // Extract unique options for dropdowns
    const uniqueProperties = useMemo(() => {
        const props = new Map();
        allAllocations.forEach(r => props.set(r.propertyId, r.property));
        return Array.from(props.entries()).map(([id, name]) => ({ id, name }));
    }, [allAllocations]);

    const uniquePeriods = useMemo(() => {
        const periods = new Set<string>();
        allAllocations.forEach(r => {
            periods.add(r.periodRaw.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
        });
        return Array.from(periods);
    }, [allAllocations]);

    const uniqueProviders = useMemo(() => {
        const providers = new Set<string>();
        allAllocations.forEach(r => providers.add(r.provider));
        return Array.from(providers).sort();
    }, [allAllocations]);


    const handleExportCSV = () => {
        const headers = ["Unit", "Tenant", "Utility", "Period", "Amount", "Basis", "Property"];
        const rows = filteredAllocations.map(r => [
            r.unit,
            r.tenant,
            r.utility,
            r.period,
            r.amount.toFixed(2),
            r.basis,
            r.property
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(c => `"${c}"`).join(",")) // Quote fields to handle commas
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `allocations_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 pb-12 max-w-[1400px] mx-auto">

            {/* 1. PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#003b73] tracking-tight">Cost Allocations</h1>
                    <p className="text-slate-500 mt-2 text-base">
                        Finalized utility bill distributions per tenant
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-[#003b73]"
                    onClick={handleExportCSV}
                    disabled={filteredAllocations.length === 0}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* 2. FILTER BAR */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-1 rounded-lg">
                <Select value={filterProperty} onValueChange={setFilterProperty}>
                    <SelectTrigger className="w-[180px] bg-white border-slate-200">
                        <SelectValue placeholder="Property" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
                        <SelectItem value="all">All Properties</SelectItem>
                        {uniqueProperties.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterProvider} onValueChange={setFilterProvider}>
                    <SelectTrigger className="w-[200px] bg-white border-slate-200">
                        <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
                        <SelectItem value="all">All Providers</SelectItem>
                        {uniqueProviders.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterUtility} onValueChange={setFilterUtility}>
                    <SelectTrigger className="w-[140px] bg-white border-slate-200">
                        <SelectValue placeholder="Utility Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
                        <SelectItem value="all">All Utilities</SelectItem>
                        <SelectItem value="Electricity">Electricity</SelectItem>
                        <SelectItem value="Water">Water</SelectItem>
                        <SelectItem value="Gas">Gas</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200">
                        <SelectValue placeholder="Billing Period" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
                        <SelectItem value="all">All Periods</SelectItem>
                        {uniquePeriods.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search unit or tenant..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-slate-200"
                    />
                </div>
            </div>

            {/* 3. SUMMARY SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Allocated</div>
                    <div className="text-2xl font-bold text-[#003b73]">{formatCurrency(summary.totalAmount)}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Tenants Billed</div>
                    <div className="text-2xl font-bold text-slate-900">{summary.tenantCount}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Utility Type</div>
                        <div className="text-lg font-semibold text-slate-700">{summary.utilityType}</div>
                    </div>
                    {summary.utilityType === 'Electricity' && <Zap className="w-6 h-6 text-amber-500 opacity-20" />}
                    {summary.utilityType === 'Water' && <Droplets className="w-6 h-6 text-blue-500 opacity-20" />}
                    {summary.utilityType === 'Gas' && <Flame className="w-6 h-6 text-orange-500 opacity-20" />}
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Billing Period</div>
                    <div className="text-lg font-semibold text-slate-700">{summary.period}</div>
                </div>
            </div>

            {/* 4. ALLOCATION TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="border-b border-slate-200">
                            <TableHead className="w-[80px] font-bold text-slate-600 pl-6 py-4">Unit</TableHead>
                            <TableHead className="w-[160px] font-bold text-slate-600 py-4">Tenant</TableHead>
                            <TableHead className="w-[160px] font-bold text-slate-600 py-4">Property</TableHead>
                            <TableHead className="w-[180px] font-bold text-slate-600 py-4">Provider</TableHead>
                            <TableHead className="w-[100px] font-bold text-slate-600 py-4">Utility</TableHead>
                            <TableHead className="w-[160px] font-bold text-slate-600 py-4">Period</TableHead>
                            <TableHead className="w-[120px] font-bold text-slate-600 py-4">Amount</TableHead>
                            <TableHead className="font-bold text-slate-600 py-4">
                                <div className="flex items-center gap-1">
                                    Basis
                                    <span title="The calculation method used (e.g. Metered usage from submeter readings)." className="text-slate-400 hover:text-slate-600 cursor-help">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
                                    </span>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i} className="border-b border-slate-100">
                                    <TableCell className="pl-6"><Skeleton className="h-5 w-10" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredAllocations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <FileText className="w-8 h-8 opacity-20" />
                                        <p>No allocations found matching filters</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAllocations.map((row) => (
                                <TableRow key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors h-[64px]">
                                    <TableCell className="font-semibold text-slate-900 pl-6">
                                        {row.unit}
                                    </TableCell>
                                    <TableCell className="text-slate-700 font-medium">
                                        {row.tenant}
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm">
                                        {row.property}
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm">
                                        {row.provider}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                            ${row.utility === 'Electricity' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                row.utility === 'Water' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    row.utility === 'Gas' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                            {row.utility}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm font-mono tracking-tight">
                                        {row.period}
                                    </TableCell>
                                    <TableCell className="font-bold text-[#003b73] text-base">
                                        {formatCurrency(row.amount)}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {row.basis}
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
