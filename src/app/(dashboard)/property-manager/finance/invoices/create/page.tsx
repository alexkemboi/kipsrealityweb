"use client";
import { useState } from "react";
import { generateFullInvoice } from "@/lib/Invoice";
import { FullInvoiceInput, Invoice } from "@/app/data/FinanceData";
import { toast } from "react-hot-toast";

export default function FullInvoiceButton({ leaseId }: { leaseId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const payload: FullInvoiceInput = { lease_id: leaseId, type: "RENT" };

    try {
      const invoice: Invoice = await generateFullInvoice(payload);
      toast.success(`Invoice created: ${invoice.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="bg-navy-700 text-white px-4 py-2 rounded hover:bg-navy-800 disabled:opacity-50"
    >
      {loading ? "Generating..." : "Generate Full Invoice"}
    </button>
  );
}
