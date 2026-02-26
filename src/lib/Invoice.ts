// src/lib/finance.ts (or wherever fetchInvoices is currently defined)
interface InvoiceFilters {
  status?: "PENDING" | "PAID" | "OVERDUE";
  lease_id?: string;
  type?: "RENT" | "UTILITY" | "MAINTENANCE" | "DAMAGE";
  pastDue?: "1"; // ✅ NEW
}

export async function fetchInvoices(filters?: InvoiceFilters): Promise<GroupedInvoice[]> {
  try {
    const params = new URLSearchParams();

    if (filters?.status) params.set("status", filters.status);
    if (filters?.lease_id) params.set("lease_id", filters.lease_id);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.pastDue === "1") params.set("pastDue", "1"); // ✅ NEW

    const query = params.toString();

    // ✅ Keep your current API path unless you change the backend route.
    const url = `/api/invoices${query ? `?${query}` : ""}`;

    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include", // ✅ important for cookie auth
    });

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
