"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CreateInvoiceModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [leases, setLeases] = useState<any[]>([]);

    // Form State
    const [leaseId, setLeaseId] = useState("");
    const [type, setType] = useState("RENT");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

    // Fetch Leases on Open
    useEffect(() => {
        if (isOpen) {
            fetch("/api/tenants")
                .then(res => res.json())
                .then(data => {
                    if (data.data) setLeases(data.data);
                    else if (Array.isArray(data)) setLeases(data);
                })
                .catch(err => console.error("Failed to load tenants", err));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leaseId || !amount) {
            toast.error("Please select a tenant and amount");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/invoices/manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leaseId, // API now expects leaseId
                    type,
                    amount: parseFloat(amount),
                    dueDate
                })
            });

            if (!res.ok) throw new Error("Failed to create invoice");

            toast.success("Invoice Created & Posted to GL!");
            setIsOpen(false);
            window.location.reload(); // Refresh the list
        } catch (error) {
            toast.error("Error creating invoice");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" /> Create Invoice
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Create Manual Invoice</h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Tenant Select */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Tenant (Lease)</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50 cursor-pointer"
                            value={leaseId}
                            onChange={(e) => setLeaseId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose Tenant --</option>
                            {leases.map((lease: any) => (
                                <option key={lease.id} value={lease.id}>
                                    {lease.tenant?.firstName} {lease.tenant?.lastName} ({lease.unit?.unitNumber || 'No Unit'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Invoice Type</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50 cursor-pointer"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="RENT">Rent</option>
                            <option value="UTILITY">Utility</option>
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                        <input
                            type="date"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-slate-50 cursor-pointer"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-8">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-600 hover:bg-slate-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-semibold shadow-md shadow-blue-200"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {loading ? "Generating..." : "Generate Invoice"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
