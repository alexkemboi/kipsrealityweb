"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, FileText, Gauge } from "lucide-react";
import Link from "next/link";

interface UtilityActionsMenuProps {
    utilityId: string;
}

/**
 * Actions dropdown menu for utility rows.
 * Navigation only - no mutations from menu.
 */
export function UtilityActionsMenu({ utilityId }: UtilityActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-[#30D5C8]/10"
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link
                        href={`/property-manager/content/utilities/${utilityId}`}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <Eye className="h-4 w-4" />
                        View Utility
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href={`/property-manager/content/utilities/${utilityId}#bills`}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <FileText className="h-4 w-4" />
                        Bills
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href={`/property-manager/content/utilities/${utilityId}#readings`}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <Gauge className="h-4 w-4" />
                        Readings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
