// src/lib/finance.ts
import { FullInvoiceInput } from "@/app/data/FinanceData";
import { Invoice, ManualInvoiceInput } from "@/app/data/FinanceData";


export async function generateFullInvoice(data: FullInvoiceInput): Promise<Invoice> {
  const res = await fetch("/api/invoices/full", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || "Failed to generate full invoice");
  }

  const invoice: Invoice = await res.json();
  return invoice;
}


export async function createManualInvoice(data: ManualInvoiceInput): Promise<Invoice> {
  const res = await fetch("/api/invoices/manual", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || "Failed to create manual invoice");
  }

  const invoice: Invoice = await res.json();
  return invoice;
}
