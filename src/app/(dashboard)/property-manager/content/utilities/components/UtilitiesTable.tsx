"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UtilityStatusBadge } from "./UtilityStatusBadge";
import { UtilityActionsMenu } from "./UtilityActionsMenu";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface UtilityWithBillInfo {
    id: string;
    name: string;
    type: "FIXED" | "METERED";
    propertyId?: string;
    propertyName?: string;
    /** Split method from the most recent bill, if any */
    lastBillSplitMethod?: string;
    /** Status from the most recent bill, if any */
    lastBillStatus?: string | null;
}

interface UtilitiesTableProps {
    utilities: UtilityWithBillInfo[];
    isLoading?: boolean;
}

/**
 * Utilities table with last-bill awareness.
 * Includes skeleton loading state and improved styling.
 */
export function UtilitiesTable({ utilities, isLoading }: UtilitiesTableProps) {
    if (isLoading) {
        return <UtilitiesTableSkeleton />;
    }

    if (utilities.length === 0) {
        return (
            <div className="text-center py-16 space-y-4 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200 m-4">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[#0b1f3a]">No utilities found</h3>
                    <p className="text-[#15386a]/60 max-w-sm mx-auto mt-1">
                        Get started by creating a new utility configuration for your properties.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50 border-b border-slate-200">
                        <TableHead className="w-[250px] text-[#0b1f3a] font-semibold h-12">
                            Utility Name
                        </TableHead>
                        <TableHead className="w-[200px] text-[#0b1f3a] font-semibold">
                            Property
                        </TableHead>
                        <TableHead className="w-[150px] text-[#0b1f3a] font-semibold">
                            Billing Type
                        </TableHead>
                        <TableHead className="w-[180px] text-[#0b1f3a] font-semibold">
                            Allocation Method
                        </TableHead>
                        <TableHead className="w-[150px] text-[#0b1f3a] font-semibold">
                            Last Bill Status
                        </TableHead>
                        <TableHead className="w-[80px] text-right text-[#0b1f3a] font-semibold">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {utilities.map((utility) => (
                        <TableRow
                            key={utility.id}
                            className="hover:bg-blue-50/50 transition-colors group border-b border-slate-100 last:border-0"
                        >
                            <TableCell className="font-medium text-[#0b1f3a] py-4">
                                <Link
                                    href={`/property-manager/content/utilities/${utility.id}`}
                                    className="group-hover:text-[#30D5C8] transition-colors font-semibold"
                                >
                                    {utility.name}
                                </Link>
                            </TableCell>
                            <TableCell className="text-[#15386a]">
                                {utility.propertyName ?? <span className="text-slate-400 italic">Unassigned</span>}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`font-medium border-0 px-2.5 py-0.5 ${utility.type === "FIXED"
                                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                                        }`}
                                >
                                    {utility.type === "FIXED" ? "Fixed Rate" : "Metered"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-[#15386a] text-sm">
                                {formatSplitMethod(utility.lastBillSplitMethod)}
                            </TableCell>
                            <TableCell>
                                <UtilityStatusBadge status={utility.lastBillStatus ?? null} />
                            </TableCell>
                            <TableCell className="text-right">
                                <UtilityActionsMenu utilityId={utility.id} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function UtilitiesTableSkeleton() {
    return (
        <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 h-10 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center p-4 border-b border-slate-100 last:border-0">
                    <div className="w-[250px] pr-4">
                        <Skeleton className="h-4 w-3/4 bg-slate-200" />
                    </div>
                    <div className="w-[200px] pr-4">
                        <Skeleton className="h-4 w-1/2 bg-slate-200" />
                    </div>
                    <div className="w-[150px] pr-4">
                        <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
                    </div>
                    <div className="w-[180px] pr-4">
                        <Skeleton className="h-4 w-2/3 bg-slate-200" />
                    </div>
                    <div className="w-[150px] pr-4">
                        <Skeleton className="h-6 w-24 rounded-full bg-slate-200" />
                    </div>
                    <div className="flex-1 flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-md bg-slate-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Formats the split method enum to a human-readable label.
 * Display only - no calculation.
 */
function formatSplitMethod(method?: string): string {
    if (!method) return "—";

    const labels: Record<string, string> = {
        EQUAL: "Equal Usage",
        OCCUPANCY_BASED: "Occupancy-based",
        SQ_FOOTAGE: "Square Footage",
        SUB_METERED: "Sub-metered",
        CUSTOM_RATIO: "Custom Ratio",
        AI_OPTIMIZED: "AI Optimized",
    };

    return labels[method] ?? method;
}
