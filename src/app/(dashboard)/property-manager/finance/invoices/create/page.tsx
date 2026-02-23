"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { generateFullInvoice } from "@/lib/Invoice";
import type { FullInvoiceInput, Invoice } from "@/app/data/FinanceData";

export default function FullInvoiceButton({ leaseId }: { leaseId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!leaseId?.trim()) {
      toast.error("Missing lease ID");
      return;
    }

    setLoading(true);

    const payload: FullInvoiceInput = {
      leaseId,
      type: "RENT",
    };

    try {
      const invoice: Invoice = await generateFullInvoice(payload);
      toast.success(`Invoice created: ${invoice.id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to generate invoice";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      aria-busy={loading}
      className="bg-navy-700 text-white px-4 py-2 rounded hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Generating..." : "Generate Full Invoice"}
    </button>
  );
}
