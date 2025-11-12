"use client";

import { useState } from "react";
import { createManualInvoice } from "@/lib/Invoice";
import { ManualInvoiceInput, Invoice } from "@/app/data/FinanceData";
import { toast } from "react-hot-toast";

interface ManualInvoiceFormProps {
  leaseId: string;
}

export default function ManualInvoiceForm({ leaseId }: ManualInvoiceFormProps) {
  const [amount, setAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const data: ManualInvoiceInput = {
      lease_id: leaseId,
      type: "RENT", // fixed type
      amount: parseFloat(amount),
      dueDate,
    };

    setLoading(true);
    try {
      const invoice: Invoice = await createManualInvoice(data);
      toast.success(`Manual Rent invoice created: ${invoice.id}`);
      // Reset form
      setAmount("");
      setDueDate("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create manual invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex  bg-gray-50">
      <div className="bg-white shadow rounded-xl p-6 max-w-md w-full">
        

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600  text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Rent Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}
