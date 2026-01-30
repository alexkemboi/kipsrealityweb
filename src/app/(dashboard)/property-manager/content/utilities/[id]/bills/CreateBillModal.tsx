"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { UtilitySplitMethod } from "@/lib/utilities/utility-types";

interface Property {
    id: string;
    name: string;
}

interface CreateBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    utilityId: string;
    utilityName: string;
}

/**
 * CreateBillModal - Create a new utility bill
 * 
 * Responsibilities:
 * - Collect bill details: provider, amount, dates, split method
 * - Submit to backend createBill()
 * - Bill starts in DRAFT status
 * - No calculations - all math is backend-only
 */
export function CreateBillModal({
    isOpen,
    onClose,
    onSuccess,
    utilityId,
    utilityName,
}: CreateBillModalProps) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
    const [providerName, setProviderName] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
    const [dueDate, setDueDate] = useState("");
    const [splitMethod, setSplitMethod] = useState<UtilitySplitMethod>(
        UtilitySplitMethod.EQUAL
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProperties, setIsLoadingProperties] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load properties when modal opens
    useEffect(() => {
        if (isOpen) {
            loadProperties();
        }
    }, [isOpen]);

    const loadProperties = async () => {
        try {
            setIsLoadingProperties(true);
            const res = await fetch("/api/propertymanager");
            const data = await res.json();

            const props = Array.isArray(data)
                ? data
                : Array.isArray(data.data)
                    ? data.data
                    : [];

            setProperties(props);

            // Auto-select first property if only one
            if (props.length === 1) {
                setSelectedPropertyId(props[0].id);
            }
        } catch (err) {
            console.error("Load properties error:", err);
        } finally {
            setIsLoadingProperties(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        const amount = parseFloat(totalAmount);
        if (isNaN(amount) || amount <= 0) {
            setError("Total amount must be a positive number");
            return;
        }

        if (!providerName.trim()) {
            setError("Provider name is required");
            return;
        }

        if (!selectedPropertyId) {
            setError("Please select a property");
            return;
        }

        if (!dueDate) {
            setError("Due date is required");
            return;
        }

        if (new Date(dueDate) < new Date(billDate)) {
            setError("Due date cannot be before bill date");
            return;
        }

        setIsSubmitting(true);

        try {
            // Use new API endpoint
            const res = await fetch(`/api/utilities/${utilityId}/bills`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId: selectedPropertyId,
                    providerName: providerName.trim(),
                    totalAmount: amount,
                    billDate: new Date(billDate),
                    dueDate: new Date(dueDate),
                    splitMethod,
                }),
            });

            const data = await res.json();

            if (data.success) {
                onSuccess();
                handleClose();
            } else {
                // Map backend errors
                const errorMessages: Record<string, string> = {
                    INVALID_PROPERTY: "Invalid property selected.",
                    INVALID_DATES: "Bill date must be before due date.",
                    INVALID_AMOUNT: "Total amount must be a positive number.",
                    PROPERTY_NOT_FOUND: "Property not found.",
                };
                setError(errorMessages[data.error] || data.message || "Failed to create bill");
            }
        } catch (err) {
            console.error("Create bill error:", err);
            setError("An error occurred while creating the bill");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedPropertyId("");
        setProviderName("");
        setTotalAmount("");
        setBillDate(new Date().toISOString().split("T")[0]);
        setDueDate("");
        setSplitMethod(UtilitySplitMethod.EQUAL);
        setError(null);
        onClose();
    };

    const splitMethodLabels: Record<UtilitySplitMethod, string> = {
        [UtilitySplitMethod.EQUAL]: "Equal Usage",
        [UtilitySplitMethod.OCCUPANCY_BASED]: "Occupancy-based",
        [UtilitySplitMethod.SQ_FOOTAGE]: "Square Footage",
        [UtilitySplitMethod.SUB_METERED]: "Sub-metered",
        [UtilitySplitMethod.CUSTOM_RATIO]: "Custom Ratio",
        [UtilitySplitMethod.AI_OPTIMIZED]: "AI Optimized",
    };

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Utility Bill</DialogTitle>
                    <DialogDescription>
                        Create a new utility bill for <strong>{utilityName}</strong>.
                        The bill will start in DRAFT status.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="property">
                            Property <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={selectedPropertyId}
                            onValueChange={setSelectedPropertyId}
                            disabled={isSubmitting || isLoadingProperties}
                        >
                            <SelectTrigger className="border-2 border-slate-200 focus:border-[#30D5C8]">
                                <SelectValue placeholder={isLoadingProperties ? "Loading..." : "Select property"} />
                            </SelectTrigger>
                            <SelectContent>
                                {properties.map((property) => (
                                    <SelectItem key={property.id} value={property.id}>
                                        {property.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="providerName">
                            Provider Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="providerName"
                            value={providerName}
                            onChange={(e) => setProviderName(e.target.value)}
                            placeholder="e.g., City Water Department"
                            disabled={isSubmitting}
                            required
                            className="border-2 border-slate-200 focus:border-[#30D5C8]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="totalAmount">
                            Total Amount <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                $
                            </span>
                            <Input
                                id="totalAmount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                                placeholder="0.00"
                                disabled={isSubmitting}
                                required
                                className="pl-7 border-2 border-slate-200 focus:border-[#30D5C8]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="billDate">
                                Bill Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="billDate"
                                type="date"
                                value={billDate}
                                onChange={(e) => setBillDate(e.target.value)}
                                disabled={isSubmitting}
                                required
                                className="border-2 border-slate-200 focus:border-[#30D5C8]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">
                                Due Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                disabled={isSubmitting}
                                required
                                className="border-2 border-slate-200 focus:border-[#30D5C8]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="splitMethod">
                            Allocation Method <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={splitMethod}
                            onValueChange={(value) => setSplitMethod(value as UtilitySplitMethod)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="border-2 border-slate-200 focus:border-[#30D5C8]">
                                <SelectValue placeholder="Select allocation method" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(splitMethodLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                            Determines how the bill is split across units
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !selectedPropertyId}
                            className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Bill"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
