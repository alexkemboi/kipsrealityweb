// lib/lease.ts

export interface Lease {
  id: string;
  tenant: any;
  property: any;
  unit: any;
  application: any;
  rentAmount: number;
  paymentFrequency: string;
  paymentDueDay?: number;
  createdAt: string;
  updatedAt: string;
}

// Fetch all leases for the current manager
export async function fetchManagerLeases(): Promise<Lease[]> {
  try {
    const res = await fetch("/api/leases", { cache: "no-store" }); // assumes your API route is /api/leases

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error || "Failed to fetch leases");
    }

    const data: Lease[] = await res.json();
    return data;
  } catch (error: any) {
    console.error("fetchManagerLeases error:", error);
    throw new Error(error?.message || "Unexpected error fetching leases");
  }
}

// Fetch lease for a specific tenant
export async function fetchLeaseForTenant(tenantId: string): Promise<Lease | null> {
  try {
    const res = await fetch(`/api/lease?tenantId=${tenantId}`, { cache: "no-store" });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error || "Failed to fetch lease for tenant");
    }

    const data = await res.json();
    return data[0] || null; // assume one lease per tenant
  } catch (error: any) {
    console.error("fetchLeaseForTenant error:", error);
    throw new Error(error?.message || "Unexpected error fetching lease for tenant");
  }
}
