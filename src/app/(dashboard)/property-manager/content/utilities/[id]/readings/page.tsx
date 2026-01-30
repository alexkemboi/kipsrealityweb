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
import { Plus, Gauge, ArrowLeft, Lock, Calendar } from "lucide-react";
import Link from "next/link";
import { AddReadingModal } from "./AddReadingModal";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Reading {
    id: string;
    readingDate: string;
    readingValue: number;
    createdAt: string;
    unit?: { unitNumber: string };
    tenant?: { name: string };
}

interface LeaseUtility {
    id: string;
    unitNumber: string;
    tenantName: string;
}

export default function ReadingsPage() {
    const { id } = useParams();
    const utilityId = id as string;

    const [readings, setReadings] = useState<Reading[]>([]);
    const [leaseUtilities, setLeaseUtilities] = useState<LeaseUtility[]>([]);
    const [selectedLeaseUtility, setSelectedLeaseUtility] = useState<string>("");
    const [utilityName, setUtilityName] = useState<string>("Utility");
    const [utilityType, setUtilityType] = useState<"FIXED" | "METERED">("METERED");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [utilityId]);

    const loadData = async () => {
        try {
            setIsLoading(true);

            const [utilRes, readingsRes, leaseUtilRes] = await Promise.all([
                fetch(`/api/utilities/${utilityId}`),
                fetch(`/api/utilities/${utilityId}/readings`),
                fetch("/api/lease-utility"),
            ]);

            const utilData = await utilRes.json();
            const readingsData = await readingsRes.json();
            const leaseUtilData = await leaseUtilRes.json();

            const utility = utilData?.data || utilData;
            if (utility) {
                setUtilityName(utility.name || "Utility");
                setUtilityType(utility.type || "METERED");
            }

            if (readingsData.success) {
                setReadings(readingsData.data || []);
            }

            const allLeaseUtilities = leaseUtilData?.data || leaseUtilData || [];
            const filteredLeaseUtilities = allLeaseUtilities.filter(
                (lu: { utilityId: string }) => lu.utilityId === utilityId
            );
            setLeaseUtilities(filteredLeaseUtilities);
        } catch (err) {
            console.error("Load readings error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReadingAdded = () => {
        loadData();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Fixed utilities don't have readings view
    if (!isLoading && utilityType === "FIXED") {
        return (
            <div className="min-h-screen bg-slate-50/50 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Link href={`/property-manager/content/utilities/${utilityId}`}>
                        <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 pl-0">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Utility
                        </Button>
                    </Link>

                    <Card className="border-slate-200 shadow-sm rounded-xl">
                        <CardContent className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Gauge className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0b1f3a] mb-2">
                                No Meter Readings needed
                            </h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                This utilizes a <strong>Fixed Rate</strong> billing method, which does not require meter readings.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

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
                        <h2 className="text-2xl font-bold text-[#0b1f3a] tracking-tight">Meter Readings</h2>
                        <p className="text-slate-500 text-sm">Historical readings for {utilityName}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                        <div className="w-full sm:w-[280px]">
                            <Select value={selectedLeaseUtility} onValueChange={setSelectedLeaseUtility}>
                                <SelectTrigger className="bg-white border-slate-200">
                                    <SelectValue placeholder="Select Unit to Add Reading" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaseUtilities.length === 0 ? (
                                        <div className="p-2 text-sm text-slate-500 text-center">No units assigned</div>
                                    ) : (
                                        leaseUtilities.map((lu) => (
                                            <SelectItem key={lu.id} value={lu.id}>
                                                Unit {lu.unitNumber} - {lu.tenantName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            disabled={!selectedLeaseUtility}
                            className="bg-[#30D5C8] hover:bg-[#2bcbbe] text-white shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Reading
                        </Button>
                    </div>
                </div>

                {/* Audit Notice */}
                <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-4 flex items-start gap-3 shadow-sm">
                    <div className="bg-amber-100 p-1.5 rounded-full mt-0.5">
                        <Lock className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-amber-900">Immutable Audit Log</h4>
                        <p className="text-sm text-amber-800/80 mt-0.5">
                            To ensure billing accuracy and audit integrity, meter readings cannot be modified or deleted once recorded.
                        </p>
                    </div>
                </div>

                {/* Readings Table */}
                <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                    </div>
                                ))}
                            </div>
                        ) : readings.length === 0 ? (
                            <div className="text-center py-20 space-y-4">
                                <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                    <Gauge className="w-8 h-8 text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-[#0b1f3a]">No readings found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-1">
                                        Select a unit from the dropdown above to add the first meter reading.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                                        <TableHead className="font-semibold text-[#0b1f3a]">Reading Date</TableHead>
                                        <TableHead className="font-semibold text-[#0b1f3a]">Value</TableHead>
                                        <TableHead className="font-semibold text-[#0b1f3a]">Unit</TableHead>
                                        <TableHead className="font-semibold text-[#0b1f3a]">Tenant</TableHead>
                                        <TableHead className="font-semibold text-[#0b1f3a] text-right">Recorded At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {readings.map((reading) => (
                                        <TableRow key={reading.id} className="hover:bg-blue-50/30 border-b border-slate-50 last:border-0">
                                            <TableCell className="font-medium text-[#0b1f3a]">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {formatDate(reading.readingDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono bg-slate-100 text-slate-700 hover:bg-slate-200">
                                                    {reading.readingValue.toLocaleString()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {reading.unit?.unitNumber ?? "—"}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {reading.tenant?.name ?? "—"}
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-xs text-right">
                                                {formatDateTime(reading.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <AddReadingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleReadingAdded}
                    leaseUtilityId={selectedLeaseUtility}
                    utilityId={utilityId}
                    utilityName={utilityName}
                />
            </div>
        </div>
    );
}
