// src/app/finance/tenants/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchTenantsWithFinancials } from "@/lib/Invoice";
import { toast } from "sonner";
import TenantCard from "@/components/Dashboard/propertymanagerdash/invoice/TenantCard";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchTenantsWithFinancials();
        setTenants(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load tenants");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tenants & Balances</h1>

        {loading ? (
          <div className="text-center py-20">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((lease) => (
              <TenantCard key={lease.id} lease={lease} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
