"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface Receipt {
  id: string;
  receiptNo: string;
  issuedOn: string;
  paymentId: string;
  invoiceId: string;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  paidOn?: string;
  receipt?: Receipt[];
}

interface Lease {
  id: string;
}

interface Invoice {
  id: string;
  leaseId: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  Lease: Lease;
  payment: Payment[];
}

interface TenantInvoicesProps {
  tenantId: string;
}

export default function TenantInvoices({ tenantId }: TenantInvoicesProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoice/tenant/${tenantId}`);
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }

  async function payInvoice(invoiceId: string) {
    try {
      const amountToPay = invoices.find(inv => inv.id === invoiceId)?.amount || 0;
      const res = await fetch(`/api/invoice/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountToPay, method: "Mpesa" }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Payment successful");
        fetchInvoices();
      } else {
        toast.error(data.error || "Payment failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment failed");
    }
  }

  async function viewReceipt(paymentId: string) {
    try {
      const res = await fetch(`/api/receipt/${paymentId}`);
      if (!res.ok) throw new Error("Receipt not found");
      const receipt: Receipt = await res.json();

      // Open PDF or show receipt details
      // Here we simply alert the receipt number, you can integrate PDF download later
      alert(`Receipt No: ${receipt.receiptNo}\nIssued On: ${new Date(receipt.issuedOn).toLocaleDateString()}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch receipt");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Invoices</h1>
      {loading ? (
        <p>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Invoice No</th>
              <th className="border px-4 py-2">Amount (USD)</th>
              <th className="border px-4 py-2">Due Date</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr key={inv.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="border px-4 py-2">{inv.id.slice(0, 8)}</td>
                <td className="border px-4 py-2">{inv.amount.toFixed(2)}</td>
                <td className="border px-4 py-2">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{inv.status}</td>
                <td className="border px-4 py-2 flex gap-2">
                  {inv.status === "PENDING" && (
                    <Button onClick={() => payInvoice(inv.id)}>Pay Now</Button>
                  )}
                  {inv.status === "PAID" &&
                    inv.payment.map(pmt =>
                      pmt.receipt?.map(rcpt => (
                        <Button key={rcpt.id} onClick={() => viewReceipt(pmt.id)}>
                          View Receipt
                        </Button>
                      ))
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
