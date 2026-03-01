import type { FullInvoiceInput, Invoice } from "@/app/data/FinanceData";

// ============================================================================
// TYPES & HELPERS
// ============================================================================

export interface InvoiceFilters {
  status?: "PENDING" | "PAID" | "OVERDUE";
  leaseId?: string; // Using camelCase to match new Prisma schema
  type?: "RENT" | "UTILITY" | "MAINTENANCE" | "DAMAGE" | "LATE_FEE" | "DEPOSIT";
  pastDue?: "1";
}

type ApiErrorResponse = {
  error?: string;
};

// Robust error message extractor from your original file
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

// ============================================================================
// EXPORTED API FUNCTIONS
// ============================================================================

// --- 1. FETCH ALL INVOICES ---
export async function fetchInvoices(filters?: InvoiceFilters) {
  try {
    const params = new URLSearchParams();

    if (filters?.status) params.set("status", filters.status);
    if (filters?.leaseId) params.set("leaseId", filters.leaseId);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.pastDue === "1") params.set("pastDue", "1");

    const query = params.toString();
    const url = `/api/invoices${query ? `?${query}` : ""}`;

    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) throw new Error(`Failed to fetch invoices: ${res.statusText}`);
    return await res.json();
  } catch (error: any) {
    console.error("fetchInvoices error:", error);
    throw error; 
  }
}

// --- 2. FETCH SINGLE INVOICE ---
export async function fetchInvoiceById(id: string) {
  const res = await fetch(`/api/invoices/${id}`);
  if (!res.ok) throw new Error("Failed to fetch invoice");
  return res.json();
}

// --- 3. FETCH INVOICES FOR TENANT ---
export async function fetchInvoicesForTenant(tenantId?: string) {
  const url = tenantId 
    ? `/api/invoices?tenantId=${tenantId}` 
    : `/api/invoices/tenant`; 

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch tenant invoices");
  return res.json();
}

// --- 4. MANUAL INVOICE CREATION ---
export async function createManualInvoice(data: any) {
  const res = await fetch("/api/invoices/manual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  let resData: unknown;
  try {
    resData = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(resData, "Failed to create manual invoice"));
  }
  return resData;
}

// --- 5. FULL RENT INVOICE GENERATION  ---
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

// --- 6. UTILITY INVOICE GENERATION ---
export async function generateUtilityInvoice(leaseId: string) {
  const res = await fetch(`/api/invoices/utilities/${leaseId}`, {
    method: "POST",
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Failed to generate utility invoice"));
  }
  return data;
}

// --- 7. FETCH TENANTS WITH FINANCIALS ---
export async function fetchTenantsWithFinancials() {
  const res = await fetch("/api/tenants"); 
  if (!res.ok) throw new Error("Failed to fetch tenants");
  return res.json();
}

// --- 8. DOWNLOAD PDF ---
export async function downloadInvoicePDF(invoiceId: string) {
  const res = await fetch(`/api/invoices/${invoiceId}/download`);
  if (!res.ok) throw new Error("Failed to download PDF");
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}