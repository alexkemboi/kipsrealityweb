// src/lib/finance.ts
import { FullInvoiceInput, ManualInvoiceInput, Invoice } from "@/app/data/FinanceData";

export async function generateFullInvoice(data: FullInvoiceInput): Promise<Invoice> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices/full`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) {
      let errMsg = "Failed to generate full invoice";
      try {
        const errData = await res.json();
        errMsg = errData?.error || errMsg;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errMsg);
    }

    const invoice: Invoice = await res.json();
    return invoice;
  } catch (error: any) {
    console.error("generateFullInvoice error:", error);
    throw new Error(error?.message || "Unexpected error generating full invoice");
  }
}

export async function createManualInvoice(data: ManualInvoiceInput): Promise<Invoice> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices/manual`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) {
      let errMsg = "Failed to create manual invoice";
      try {
        const errData = await res.json();
        errMsg = errData?.error || errMsg;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errMsg);
    }

    const invoice: Invoice = await res.json();
    return invoice;
  } catch (error: any) {
    console.error("createManualInvoice error:", error);
    throw new Error(error?.message || "Unexpected error creating manual invoice");
  }
}

// src/lib/finance/fetchInvoices.ts
interface InvoiceFilters {
  status?: "PENDING" | "PAID" | "OVERDUE";
  lease_id?: string;
  type?: "RENT" | "UTILITY";
}

export async function fetchInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
  try {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.lease_id) params.append("lease_id", filters.lease_id);
    if (filters?.type) params.append("type", filters.type);

    const query = params.toString();
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices${query ? `?${query}` : ""}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      let errMsg = `Failed to fetch invoices: ${res.statusText}`;
      try {
        const errData = await res.json();
        errMsg = errData?.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return await res.json();
  } catch (error: any) {
    console.error("fetchInvoices error:", error);
    throw new Error(error?.message || "Unexpected error fetching invoices");
  }
}
