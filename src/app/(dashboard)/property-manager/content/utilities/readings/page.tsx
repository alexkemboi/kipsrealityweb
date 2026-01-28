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
import { Plus, Lock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AddReadingModal } from "../[id]/readings/AddReadingModal";

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

export default function ReadingsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [readings, setReadings] = useState<Reading[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterProperty, setFilterProperty] = useState("all");
    const [filterUtility, setFilterUtility] = useState("all");

    useEffect(() => {
        const loadReadings = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch("/api/utilities/readings");
                if (!response.ok) throw new Error("Failed to fetch readings");

                const data = await response.json();
                setReadings(data.readings || []);
            } catch (err) {
                console.error("Error loading readings:", err);
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        loadReadings();
    }, []);

    // Extract unique values for filters
    const uniqueProperties = Array.from(new Set(readings.map(r => r.propertyName)));
    const uniqueUtilities = Array.from(new Set(readings.map(r => r.utilityName)));

    const filteredReadings = readings.filter((r) => {
        if (filterProperty !== "all" && r.propertyName !== filterProperty) return false;
        if (filterUtility !== "all" && r.utilityName !== filterUtility) return false;
        return true;
    });

    const handleResetFilters = () => {
        setFilterProperty("all");
        setFilterUtility("all");
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
        setIsModalOpen(false);
        toast.success("Reading Added", { description: "Meter reading has been recorded successfully." });
    };

    const handleExportCSV = () => {
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

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

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
        <div className="space-y-4">
            {/* 1. PAGE HEADER */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Utility Readings</h1>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Audit Log: Readings are immutable
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                    >
                        <Download className="w-4 h-4 mr-2 text-slate-500" />
                        Export CSV
                    </Button>
                    <Button
                        className="bg-[#003b73] hover:bg-[#002b5b] text-white shadow-sm"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reading
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* 2. FILTER ROW */}
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <Select value={filterProperty} onValueChange={setFilterProperty}>
                    <SelectTrigger className="w-[180px] bg-white border-slate-200 hover:bg-slate-50">
                        <SelectValue placeholder="Property" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-lg">
                        <SelectItem value="all" className="hover:bg-slate-100 focus:bg-slate-100 cursor-pointer">
                            All Properties
                        </SelectItem>
                        {uniqueProperties.map((p) => (
                            <SelectItem
                                key={p}
                                value={p}
                                className="hover:bg-slate-100 focus:bg-slate-100 cursor-pointer"
                            >
                                {p}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterUtility} onValueChange={setFilterUtility}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200 hover:bg-slate-50">
                        <SelectValue placeholder="Utility Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 shadow-lg">
                        <SelectItem value="all" className="hover:bg-slate-100 focus:bg-slate-100 cursor-pointer">
                            All Utilities
                        </SelectItem>
                        {uniqueUtilities.map((u) => (
                            <SelectItem
                                key={u}
                                value={u}
                                className="hover:bg-slate-100 focus:bg-slate-100 cursor-pointer"
                            >
                                {u}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {(filterProperty !== "all" || filterUtility !== "all") && (
                    <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-slate-500 hover:text-slate-900">
                        Reset
                    </Button>
                )}
            </div>

            {/* 3. TABLE */}
            <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[120px]">Date</TableHead>
                            <TableHead>Property</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Utility Type</TableHead>
                            <TableHead className="text-right pr-4">Reading</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}>
                                        <Skeleton className="h-4 w-full bg-slate-100" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredReadings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No readings found matching filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReadings.map((reading) => (
                                <TableRow key={reading.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-medium text-slate-900">
                                        {reading.readingDate ? new Date(reading.readingDate).toLocaleDateString() : "—"}
                                    </TableCell>
                                    <TableCell className="text-slate-600">{reading.propertyName}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal border border-slate-200">
                                            {reading.unitNumber}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{reading.tenantName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-medium
                                            ${reading.utilityName === 'Water' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                                                reading.utilityName === 'Electricity' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                                                    'text-emerald-600 bg-emerald-50 border-emerald-200'}
                                        `}>
                                            {reading.utilityName}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-slate-700 pr-4">
                                        {reading.readingValue.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Modal */}
            <AddReadingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddReading}
                leaseUtilityId=""
                utilityId=""
                utilityName=""
                isGlobalAdd={true}
                properties={uniqueProperties}
                units={[]}
            />
        </div>
    );
}
