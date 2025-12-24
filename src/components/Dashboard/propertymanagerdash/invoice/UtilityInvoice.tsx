"use client";

import { generateUtilityInvoice } from "@/lib/Invoice";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  leaseId: string;
}

export default function GenerateUtilityInvoiceButton({ leaseId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const invoice = await generateUtilityInvoice(leaseId);

      if (!invoice || !invoice.InvoiceItem?.length) {
        toast.error("⚠️ No utilities found for this lease.");
        return;
      }

      const totalAmount = invoice.amount ?? 0;
      toast.success(`✅ Utility invoice generated! Total: $${totalAmount.toFixed(2)}`);
      console.log("Generated invoice:", invoice);
    } catch (error: any) {
      console.error("Error generating utility invoice:", error);

      if (error.message?.includes("No utilities")) {
        toast.error("⚠️ No utilities found for this lease.");
      } else {
        toast.error(error?.message || "Failed to generate utility invoice.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className={`mt-4 px-4 py-2 rounded-lg shadow text-white transition-all duration-200 
        ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
    >
      {loading ? "Generating..." : "Generate Utility Invoice"}
    </button>
  );
}
