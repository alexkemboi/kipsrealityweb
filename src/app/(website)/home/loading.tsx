// @/lib/Invoice.ts

import type { FullInvoiceInput, Invoice } from "@/app/data/FinanceData";

type ApiErrorResponse = {
  error?: string;
};

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as ApiErrorResponse).error === "string"
  ) {
    return (data as ApiErrorResponse).error as string;
  }

  return fallback;
}

/**
 * Calls the backend API route to generate a full invoice.
 * Backend route expected at: /api/invoices/full
 */
export async function generateFullInvoice(
  payload: FullInvoiceInput
): Promise<Invoice> {
  const res = await fetch("/api/invoices/full", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  let data: unknown;

  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Failed to generate invoice"));
  }

  return data as Invoice;
}
