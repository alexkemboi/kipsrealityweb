import { useState } from "react";
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
import { Loader2, AlertCircle, Calendar, Hash } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AddReadingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (reading: any) => void; // Accepts reading data from form submission
    leaseUtilityId: string;
    utilityId: string;
    utilityName: string;
    mockMode?: boolean;
    // New props for global use
    isGlobalAdd?: boolean;
    properties?: string[];
    units?: string[];
}

/**
 * AddReadingModal - Enhanced meter reading form
 */
export function AddReadingModal({
    isOpen,
    onClose,
    onSuccess,
    leaseUtilityId,
    utilityId,
    utilityName,
    mockMode = false,
    isGlobalAdd = false,
    properties = [],
    units = [],
}: AddReadingModalProps) {
    const [readingValue, setReadingValue] = useState("");
    const [readingDate, setReadingDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [selectedProperty, setSelectedProperty] = useState("");
    const [selectedUnit, setSelectedUnit] = useState("");
    const [selectedUtilityType, setSelectedUtilityType] = useState("");
    const [notes, setNotes] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Realistic Validation
        if (isGlobalAdd && (!selectedProperty || !selectedUnit || !selectedUtilityType)) {
            setError("Please select Property, Unit, and Utility Type");
            return;
        }

        const value = parseFloat(readingValue);
        if (isNaN(value) || value < 0) {
            setError("Reading value must be a non-negative number");
            return;
        }

        setIsSubmitting(true);

        try {
            if (mockMode || true) { // Defaulting to true for now as we don't have the API ready
                await new Promise(resolve => setTimeout(resolve, 800));

                if (value > 999999) {
                    throw new Error("Reading value unreasonably high");
                }

                // Pass the reading data to the parent
                onSuccess({
                    property: selectedProperty,
                    unit: selectedUnit,
                    tenant: `${selectedProperty} - ${selectedUnit} Tenant`, // Placeholder tenant name
                    utilityType: selectedUtilityType as "Water" | "Electricity" | "Gas",
                    readingValue: value,
                    readingDate: readingDate,
                });
                handleClose();
                return;
            }
        } catch (err: any) {
            console.error("Add reading error:", err);
            setError(err.message || "An error occurred while adding the reading");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReadingValue("");
        setReadingDate(new Date().toISOString().split("T")[0]);
        setSelectedProperty("");
        setSelectedUnit("");
        setSelectedUtilityType("");
        setNotes("");
        setError(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !isSubmitting && !open && handleClose()}>
            <DialogContent className="sm:max-w-[480px] bg-white border-slate-200 shadow-xl overflow-y-auto max-h-[90vh]">
                <DialogHeader className="border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#003b73] p-2.5 rounded-xl shadow-inner">
                            <Hash className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900">Add Meter Reading</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-slate-500">
                                Record a new consumption entry for the audit log.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {error && (
                        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {isGlobalAdd && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Property</Label>
                                        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Select Property" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {properties.map(p => (
                                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unit</Label>
                                        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                                <SelectValue placeholder="Select Unit" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                {units.map(u => (
                                                    <SelectItem key={u} value={u}>{u}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Utility Type</Label>
                                    <div className="flex gap-2">
                                        {["Water", "Electricity", "Gas"].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setSelectedUtilityType(type)}
                                                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${selectedUtilityType === type
                                                    ? 'bg-[#003b73] text-white border-[#003b73] shadow-md'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="readingValue" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Reading Value <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="readingValue"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={readingValue}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReadingValue(e.target.value)}
                                        placeholder="0.00"
                                        disabled={isSubmitting}
                                        required
                                        className="pl-9 bg-slate-50 border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="readingDate" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Reading Date <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="readingDate"
                                        type="date"
                                        value={readingDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReadingDate(e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                        className="pl-9 bg-slate-50 border-slate-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Notes / Remarks</Label>
                            <Textarea
                                id="notes"
                                placeholder="Any observations about the meter or reading..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="bg-slate-50 border-slate-200 min-h-[80px]"
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                            <span className="font-bold">Important:</span> Readings are immutable once saved. Please verify the value matches the physical meter before proceeding.
                        </p>
                    </div>

                    <DialogFooter className="border-t border-slate-50 pt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-slate-500 font-bold hover:bg-slate-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !readingValue}
                            className="bg-[#003b73] hover:bg-[#002b5b] text-white px-8 h-11 font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Commit Reading"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
