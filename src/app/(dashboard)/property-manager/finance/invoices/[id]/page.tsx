"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface Invoice {
  id: string;
  lease_id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lease?: {
    tenant?: {
      firstName: string;
      lastName: string;
    };
    property?: {
      name: string;
    };
  };
}


export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      toast.error("Unable to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
        Loading invoice details...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p>Invoice not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Invoice Details
        </h1>

        <div className="space-y-4 text-gray-700">
          <div>
            <p className="font-semibold text-gray-500 text-sm uppercase">
              Invoice ID
            </p>
            <p className="font-mono">{invoice.id}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500 text-sm uppercase">
              Lease ID
            </p>
            <p>{invoice.lease_id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-500 text-sm uppercase">
                Type
              </p>
              <p>{invoice.type}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-500 text-sm uppercase">
                Amount
              </p>
              <p className="font-semibold text-gray-900">
                KES {invoice.amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-500 text-sm uppercase">
                Due Date
              </p>
              <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-500 text-sm uppercase">
                Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  invoice.status === "PAID"
                    ? "bg-green-100 text-green-700"
                    : invoice.status === "OVERDUE"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
  <div>
    <p className="font-semibold text-gray-500 text-sm uppercase">
      Tenant
    </p>
    <p>
      {invoice.lease?.tenant
        ? `${invoice.lease.tenant.firstName} ${invoice.lease.tenant.lastName}`
        : "—"}
    </p>
  </div>

  <div>
    <p className="font-semibold text-gray-500 text-sm uppercase">
      Property
    </p>
    <p>{invoice.lease?.property?.name || "—"}</p>
  </div>
</div>

          <hr className="my-4" />

          <div className="text-sm text-gray-500">
            <p>Created: {new Date(invoice.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(invoice.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
