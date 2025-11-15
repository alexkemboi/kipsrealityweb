// src/lib/finance.ts
import { FullInvoiceInput, ManualInvoiceInput, ManualInvoiceItem,ManualUtilityItem, Invoice } from "@/app/data/FinanceData";


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


export async function fetchInvoiceById(id: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices/${id}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error || "Failed to fetch invoice");
    }

    return await res.json();
  } catch (error: any) {
    console.error("fetchInvoiceById error:", error);
    throw new Error(error?.message || "Unexpected error fetching invoice");
  }
}


// lib/Invoice.ts
export async function generateUtilityInvoice(leaseId: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices/utilities/${leaseId}`;
    const res = await fetch(url, { method: "POST" });

    const data = await res.json();

    if (!res.ok || !data.success) {
      // Throw an error so the button can catch it
      throw new Error(data.error || "Failed to generate utility invoice");
    }

    return data.data;
  } catch (error: any) {
    console.error("generateUtilityInvoice error:", error);
    throw new Error(error?.message || "Unexpected error generating utility invoice");
  }
}



export async function createManualUtilityInvoice(
  leaseId: string,
  items: ManualInvoiceItem[]
) {
  try {

      const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices/manual/utility`,{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaseId, items }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to create manual utility invoice");
    }

    return data.data;
  } catch (error: any) {
    console.error("createManualUtilityInvoice error:", error);
    throw new Error(error?.message || "Unexpected error creating manual utility invoice");
  }
}


export async function generateManualUtilityInvoiceData(leaseId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices/manual/utility/data?leaseId=${leaseId}`
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to fetch manual utility data");
    }

    // data.data should be an array of utilities
    return data.data as ManualUtilityItem[];
  } catch (error: any) {
    console.error("generateManualUtilityInvoiceData error:", error);
    throw new Error(
      error?.message || "Unexpected error fetching manual utility data"
    );
  }
}

 // src/lib/tenant.ts
export async function fetchTenantsWithFinancials() {
  const res = await fetch("/api/tenants", { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error || "Failed to fetch tenants");
  }
  return json.data;
}

export async function fetchInvoicesForTenant(tenantId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/tenants/${tenantId}/invoices`,
      { cache: "no-store" }
    );

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json?.error || "Failed to fetch tenant invoices");
    }

    return json.data;
  } catch (error: any) {
    console.error("fetchInvoicesForTenant ERROR:", error);
    throw new Error(error?.message || "Unexpected error fetching invoices");
  }
}
