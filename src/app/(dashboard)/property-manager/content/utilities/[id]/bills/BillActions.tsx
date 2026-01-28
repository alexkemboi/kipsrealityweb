"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    MoreHorizontal,
    Calculator,
    Eye,
    FileCheck,
    BookOpen,
    Loader2,
    ArrowRight,
} from "lucide-react";
import { UtilityBillStatus } from "@/lib/utilities/utility-types";
import { toast } from "sonner";
import Link from "next/link";

interface BillActionsProps {
    billId: string;
    billStatus: UtilityBillStatus | string;
    utilityId: string;
    onActionComplete: () => void;
}

export function BillActions({
    billId,
    billStatus,
    utilityId,
    onActionComplete,
}: BillActionsProps) {
    const [isAllocating, setIsAllocating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [showAllocateDialog, setShowAllocateDialog] = useState(false);
    const [showPostDialog, setShowPostDialog] = useState(false);

    const handleAllocate = async () => {
        setIsAllocating(true);
        try {
            const res = await fetch(`/api/utilities/bills/${billId}/allocate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Bill allocated successfully");
                onActionComplete();
            } else {
                toast.error(data.message || "Allocation failed");
            }
        } catch (err) {
            console.error("Allocate error:", err);
            toast.error("An error occurred during allocation");
        } finally {
            setIsAllocating(false);
            setShowAllocateDialog(false);
        }
    };

    const handlePost = async () => {
        setIsPosting(true);
        try {
            const res = await fetch(`/api/utilities/bills/${billId}/post`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Bill posted to accounting");
                onActionComplete();
            } else {
                toast.error(data.message || "Posting failed");
            }
        } catch (err) {
            console.error("Post error:", err);
            toast.error("An error occurred during posting");
        } finally {
            setIsPosting(false);
            setShowPostDialog(false);
        }
    };

    const getActions = () => {
        switch (billStatus) {
            case UtilityBillStatus.DRAFT:
            case "DRAFT":
                return [
                    {
                        label: "Allocate Bill",
                        icon: <Calculator className="w-4 h-4 text-blue-500" />,
                        action: () => setShowAllocateDialog(true),
                        loading: isAllocating,
                    },
                ];
            case UtilityBillStatus.PROCESSING:
            case "PROCESSING":
                return [
                    {
                        label: "View Allocations",
                        icon: <Eye className="w-4 h-4 text-slate-500" />,
                        href: `/property-manager/content/utilities/${utilityId}/allocations?billId=${billId}`,
                    },
                ];
            case UtilityBillStatus.APPROVED:
            case "APPROVED":
                return [
                    {
                        label: "View Allocations",
                        icon: <Eye className="w-4 h-4 text-slate-500" />,
                        href: `/property-manager/content/utilities/${utilityId}/allocations?billId=${billId}`,
                    },
                    {
                        separator: true
                    },
                    {
                        label: "Post to Accounting",
                        icon: <FileCheck className="w-4 h-4 text-green-600" />,
                        action: () => setShowPostDialog(true),
                        loading: isPosting,
                    },
                ];
            case UtilityBillStatus.POSTED:
            case "POSTED":
                return [
                    {
                        label: "View Allocations",
                        icon: <Eye className="w-4 h-4 text-slate-500" />,
                        href: `/property-manager/content/utilities/${utilityId}/allocations?billId=${billId}`,
                    },
                    {
                        label: "View Journal Entry",
                        icon: <BookOpen className="w-4 h-4 text-purple-600" />,
                        href: `/property-manager/content/finance/journal`,
                    },
                ];
            default:
                return [];
        }
    };

    const actions = getActions();

    if (actions.length === 0) {
        return null;
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-[#30D5C8]/10 hover:text-[#30D5C8] data-[state=open]:bg-[#30D5C8]/10 data-[state=open]:text-[#30D5C8]"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider font-normal">Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actions.map((action, index) => (
                        action.separator ? (
                            <DropdownMenuSeparator key={`sep-${index}`} />
                        ) : action.href ? (
                            <DropdownMenuItem key={index} asChild>
                                <Link href={action.href} className="flex items-center gap-2 cursor-pointer py-2.5">
                                    {action.icon}
                                    <span className="flex-1">{action.label}</span>
                                    <ArrowRight className="w-3 h-3 text-slate-300" />
                                </Link>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                key={index}
                                onClick={action.action}
                                disabled={action.loading}
                                className="flex items-center gap-2 cursor-pointer py-2.5"
                            >
                                {action.loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    action.icon
                                )}
                                {action.label}
                            </DropdownMenuItem>
                        )
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showAllocateDialog} onOpenChange={setShowAllocateDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Allocate Bill?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will calculate unit shares based on the selected method.
                            Status will change to <span className="font-semibold text-blue-600">PROCESSING</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isAllocating}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAllocate}
                            disabled={isAllocating}
                            className="bg-[#30D5C8] hover:bg-[#2bcbbe]"
                        >
                            {isAllocating ? "Allocating..." : "Confirm Allocation"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Post to General Ledger?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This creates a permanent journal entry. Status will change to <span className="font-semibold text-purple-600">POSTED</span>.
                            <br /><br />
                            <span className="text-amber-600 bg-amber-50 p-1 rounded text-xs font-semibold uppercase">Caution</span> This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPosting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePost}
                            disabled={isPosting}
                            className="bg-[#30D5C8] hover:bg-[#2bcbbe]"
                        >
                            {isPosting ? "Posting..." : "Confirm Post"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
