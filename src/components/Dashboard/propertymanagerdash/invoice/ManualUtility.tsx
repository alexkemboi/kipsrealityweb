"use client";

import { useState, useEffect } from "react";
import { createManualUtilityInvoice, generateManualUtilityInvoiceData } from "@/lib/Invoice";
import { ManualUtilityItem } from "@/app/data/FinanceData";
import { toast } from "sonner";

interface Props {
  leaseId: string;
}

export default function ManualUtilityInvoice({ leaseId }: Props) {
  const [items, setItems] = useState<ManualUtilityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch initial utility data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setFetching(true);
        const data = await generateManualUtilityInvoiceData(leaseId);
        setItems(
  data.map((u) => ({
    id: u.id,
    description: u.description, // 👈 convert `name` to `description`
    type: u.type,
    units: u.units ?? 1,
    amount: u.type === "FIXED" ? u.fixedAmount ?? 0 : u.unitPrice ?? 0,
  }))
);

      } catch (err: any) {
        toast.error(err.message || "Failed to fetch manual utility data");
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [leaseId]);

  const handleChange = (index: number, field: keyof ManualUtilityItem, value: any) => {
    setItems((prev) => {
      const newItems = [...prev];
      if (field === "units" || field === "amount") value = Number(value);
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const invoiceItems = items.map((i) => ({
        description: i.description,
        amount: i.type === "METERED" ? i.amount * i.units : i.amount,
        utilityId: i.id,
      }));

      const invoice = await createManualUtilityInvoice(leaseId, invoiceItems);
      toast.success("Manual utility invoice created successfully!");
      console.log("Invoice created:", invoice);
    } catch (err: any) {
      toast.error(err.message || "Failed to create manual utility invoice");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, i) => sum + (i.type === "METERED" ? i.amount * i.units : i.amount), 0);

  if (fetching) {
    return <p>Loading utilities...</p>;
  }

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Manual Utility Invoice</h2>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="flex gap-3 items-center">
            <input
              type="text"
              value={item.description}
              onChange={(e) => handleChange(idx, "description", e.target.value)}
              className="border rounded px-2 py-1 flex-1"
              placeholder="Utility description"
            />
            <select
              value={item.type}
              onChange={(e) => handleChange(idx, "type", e.target.value as "FIXED" | "METERED")}
              className="border rounded px-2 py-1"
            >
              <option value="FIXED">FIXED</option>
              <option value="METERED">METERED</option>
            </select>
            {item.type === "METERED" && (
              <input
                type="number"
                value={item.units}
                min={0}
                onChange={(e) => handleChange(idx, "units", e.target.value)}
                className="border rounded px-2 py-1 w-20"
                placeholder="Units"
              />
            )}
            <input
              type="number"
              value={item.amount}
              min={0}
              onChange={(e) => handleChange(idx, "amount", e.target.value)}
              className="border rounded px-2 py-1 w-24"
              placeholder="Amount"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <p className="font-semibold">Total: {totalAmount.toFixed(2)}</p>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white shadow ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating..." : "Create Invoice"}
        </button>
      </div>
    </div>
  );
}
