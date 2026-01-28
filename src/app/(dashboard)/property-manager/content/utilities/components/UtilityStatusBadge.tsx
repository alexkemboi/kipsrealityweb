"use client";

import { cn } from "@/lib/utils";
import { UtilityBillStatus } from "@/lib/utilities/utility-types";

interface UtilityStatusBadgeProps {
    status: UtilityBillStatus | string | null;
    className?: string;
}

/**
 * Status badge component for utility bills.
 * Maps UtilityBillStatus enum to styled badges.
 * No logic - pure display component.
 */
export function UtilityStatusBadge({ status, className }: UtilityStatusBadgeProps) {
    // Handle null/undefined status
    if (!status) {
        return (
            <span
                className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    "bg-slate-100 text-slate-600",
                    className
                )}
            >
                No Bills
            </span>
        );
    }

    const statusConfig: Record<string, { label: string; className: string }> = {
        [UtilityBillStatus.DRAFT]: {
            label: "Draft",
            className: "bg-slate-100 text-slate-700 border-slate-200",
        },
        [UtilityBillStatus.PROCESSING]: {
            label: "Processing",
            className: "bg-blue-50 text-blue-700 border-blue-200",
        },
        [UtilityBillStatus.APPROVED]: {
            label: "Approved",
            className: "bg-green-50 text-green-700 border-green-200",
        },
        [UtilityBillStatus.POSTED]: {
            label: "Posted",
            className: "bg-purple-50 text-purple-700 border-purple-200",
        },
    };

    const config = statusConfig[status] ?? {
        label: status,
        className: "bg-slate-100 text-slate-600",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                config.className,
                className
            )}
        >
            {config.label}
        </span>
    );
}
