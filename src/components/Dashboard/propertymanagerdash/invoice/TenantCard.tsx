// src/components/finance/TenantCard.tsx
"use client";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function TenantCard({ lease }: { lease: any }) {
  const router = useRouter();
  const tenantName = lease.tenant?.name || lease.tenant?.email || "Unnamed Tenant";
  const totalInvoiced = lease.financialSummary?.totalInvoiced ?? 0;
  const totalPaid = lease.financialSummary?.totalPaid ?? 0;
  const balance = lease.financialSummary?.balance ?? 0;

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{tenantName}</h3>
          <p className="text-sm text-gray-500">{lease.property?.name || "No property"} • {lease.unit?.unitNumber || "No unit"}</p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lease.leaseStatus === "SIGNED" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
            {lease.leaseStatus}
          </span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="bg-slate-50 p-3 rounded-lg mb-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Invoiced</span>
            <span className="font-medium">KES {Number(totalInvoiced).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>Total Paid</span>
            <span className="font-medium text-emerald-700">KES {Number(totalPaid).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">Balance</span>
            <span className={`font-bold ${balance > 0 ? "text-red-600" : "text-emerald-700"}`}>
              KES {Number(balance).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/property-manager/finance/tenants/${lease.tenant?.id || lease.id}`
)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Invoices
          </button>
          <button
            onClick={() => router.push(`/property-manager/lease/${lease.id}`)}
            className="px-4 py-2 border rounded"
          >
            Lease
          </button>
        </div>
      </div>
    </div>
  );
}
