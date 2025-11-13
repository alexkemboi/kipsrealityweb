"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface Property {
  id: string;
  city: string;
  address: string;
}

interface Unit {
  id: string;
  unitNumber: string;
  unitName: string | null;
}

interface Tenant {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface Lease {
  id: string;
  property: Property;
  unit: Unit;
  tenant: Tenant;
}

interface Invoice {
  id: string;
  Lease: Lease;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  type: string;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  paidOn: string;
  reference?: string;
  invoice: Invoice;
}

interface FullReceipt {
  id: string;
  receiptNo: string;
  issuedOn: string;
  payment_id: string;
  invoice_id: string;
  payment: {
    id: string;
    amount: number;
    method: string;
    paidOn: string;
    reference?: string;
    invoice: Invoice;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [generatingReceipt, setGeneratingReceipt] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<FullReceipt | null>(null);

  useEffect(() => {
    fetchPayments();
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) fetchUnits(selectedProperty);
    else setUnits([]);
    fetchPayments();
  }, [selectedProperty, selectedUnit]);

  async function fetchPayments() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedProperty) queryParams.append("propertyId", selectedProperty);
      if (selectedUnit) queryParams.append("unitNumber", selectedUnit);

      const res = await fetch(`/api/payments?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch payments");

      const data: Payment[] = await res.json();
      setPayments(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProperties() {
    try {
      const res = await fetch("/api/propertymanager");
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data: Property[] = await res.json();
      setProperties(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load properties");
    }
  }

  async function fetchUnits(propertyId: string) {
    try {
      const res = await fetch(`/api/units?propertyId=${propertyId}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const data: Unit[] = await res.json();
      setUnits(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load units");
    }
  }

  async function generateReceipt(paymentId: string) {
    setGeneratingReceipt(paymentId);
    try {
      const res = await fetch(`/api/receipt/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      if (!res.ok) throw new Error("Failed to generate receipt");

      const receipt = await res.json();
      toast.success(`Receipt ${receipt.receiptNo} generated successfully!`);
      
      // Automatically view the generated receipt
      viewReceipt(receipt.id);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate receipt");
    } finally {
      setGeneratingReceipt(null);
    }
  }

  async function viewReceipt(receiptId: string) {
    try {
      const res = await fetch(`/api/receipt/${receiptId}`);
      if (!res.ok) throw new Error("Receipt not found");
      
      const receipt: FullReceipt = await res.json();
      setViewingReceipt(receipt);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch receipt");
    }
  }

  function printReceipt() {
    window.print();
  }

  async function downloadReceipt() {
  if (!viewingReceipt) return;

  try {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '800px'; // set fixed width for consistent PDF
    container.style.background = 'white';
    document.body.appendChild(container);

    // Clone the receipt content into container
    const element = document.getElementById('receipt-content');
    if (!element) return toast.error('Receipt content not found');

    const cloned = element.cloneNode(true) as HTMLElement;
    cloned.style.transform = 'scale(1)';
    cloned.style.opacity = '1';
    container.appendChild(cloned);

    toast.loading('Generating PDF...');

    const canvas = await html2canvas(cloned, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pdfHeight);
    pdf.save(`Receipt_${viewingReceipt.receiptNo}.pdf`);

    toast.dismiss();
    toast.success('Receipt downloaded successfully!');

    // Clean up
    document.body.removeChild(container);
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.dismiss();
    toast.error('Failed to download receipt');
  }
}


  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paymentMethods = {
    CASH: payments.filter(p => p.method === "CASH").length,
    BANK: payments.filter(p => p.method === "BANK").length,
    CREDIT_CARD: payments.filter(p => p.method === "CREDIT_CARD").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Payment Records</h1>
          <p className="text-slate-600">Track and manage all rental payments</p>
        </div>

        {/* Receipt Modal */}
        {viewingReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Receipt Details</h2>
                <div className="flex gap-2">
                  <button
                    onClick={downloadReceipt}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    onClick={printReceipt}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={() => setViewingReceipt(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Receipt Content */}
              <div className="p-8" id="receipt-content">
                {/* Receipt Header */}
                <div className="text-center mb-8 pb-6 border-b-2 border-slate-200">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mb-3">
                    <h3 className="text-2xl font-bold text-white">PAYMENT RECEIPT</h3>
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-2">{viewingReceipt.receiptNo}</div>
                  <div className="text-sm text-slate-600">
                    Issued on {new Date(viewingReceipt.issuedOn).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                {/* Property & Tenant Info */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Property Details</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-slate-500">Location</div>
                        <div className="font-semibold text-slate-900">{viewingReceipt.payment.invoice.Lease.property.city}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Unit Number</div>
                        <div className="font-semibold text-slate-900">{viewingReceipt.payment.invoice.Lease.unit.unitNumber}</div>
                      </div>
                      {viewingReceipt.payment.invoice.Lease.unit.unitName && (
                        <div>
                          <div className="text-xs text-slate-500">Unit Name</div>
                          <div className="font-semibold text-slate-900">{viewingReceipt.payment.invoice.Lease.unit.unitName}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Tenant Details</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-slate-500">Name</div>
                        <div className="font-semibold text-slate-900">
                          {viewingReceipt.payment.invoice.Lease.tenant?.firstName 
                            ? `${viewingReceipt.payment.invoice.Lease.tenant.firstName} ${viewingReceipt.payment.invoice.Lease.tenant.lastName || ''}`.trim()
                            : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Email</div>
                        <div className="font-semibold text-slate-900">{viewingReceipt.payment.invoice.Lease.tenant?.email || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Lease ID</div>
                        <div className="font-semibold text-slate-900">#{viewingReceipt.payment.invoice.Lease.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Invoice Type</div>
                      <div className="text-sm font-semibold text-slate-900">{viewingReceipt.payment.invoice.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Payment Method</div>
                      <div className="text-sm font-semibold text-slate-900">{viewingReceipt.payment.method.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Payment Date</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {new Date(viewingReceipt.payment.paidOn).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Invoice Number</div>
                      <div className="text-sm font-semibold text-slate-900">#{viewingReceipt.payment.invoice.id.slice(0, 8)}</div>
                    </div>
                    {viewingReceipt.payment.reference && (
                      <div className="col-span-2">
                        <div className="text-xs text-slate-600 mb-1">Reference Number</div>
                        <div className="text-sm font-semibold text-slate-900">{viewingReceipt.payment.reference}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount Section */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-center">
                  <div className="text-white text-sm font-medium mb-2">Amount Paid</div>
                  <div className="text-white text-5xl font-bold">KES {viewingReceipt.payment.amount.toFixed(2)}</div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                  <p className="text-xs text-slate-500">
                    This is an official receipt for the payment received. Keep this for your records.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-500">Total Collected</div>
                <div className="text-2xl font-bold text-slate-800">KES {totalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-500">Total Payments</div>
                <div className="text-2xl font-bold text-slate-800">{payments.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-500">Payment Methods</div>
                <div className="text-sm font-semibold text-slate-700 mt-1">
                  Cash: {paymentMethods.CASH} | Bank: {paymentMethods.BANK} | Card: {paymentMethods.CREDIT_CARD}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-blue-100">Average Payment</div>
                <div className="text-2xl font-bold text-white">KES {payments.length > 0 ? (totalAmount / payments.length).toFixed(2) : '0.00'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Filter Payments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Property</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={selectedProperty}
                onChange={(e) => {
                  setSelectedProperty(e.target.value);
                  setSelectedUnit("");
                }}
              >
                <option value="">All Properties</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                disabled={!units.length}
              >
                <option value="">All Units</option>
                {units.map((u) => (
                  <option key={u.id} value={u.unitNumber}>
                    {u.unitNumber} {u.unitName ? `- ${u.unitName}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">Payment History</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-600">Loading payments...</p>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              <p className="text-lg font-medium">No payments found</p>
              <p className="text-sm mt-1">Payments will appear here once tenants make payments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Payment Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">#{p.id.slice(0, 8)}</div>
                            {p.reference && (
                              <div className="text-xs text-slate-500">Ref: {p.reference}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-base font-bold text-slate-900">KES {p.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          p.method === "CASH" 
                            ? "bg-green-100 text-green-800" 
                            : p.method === "BANK" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {p.method === "CASH" && "💵"}
                          {p.method === "BANK" && "🏦"}
                          {p.method === "CREDIT_CARD" && "💳"}
                          {p.method.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{new Date(p.paidOn).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{new Date(p.paidOn).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">#{p.invoice.id.slice(0, 8)}</div>
                        <div className={`text-xs ${
                          p.invoice.status === "PAID" 
                            ? "text-emerald-600" 
                            : p.invoice.status === "OVERDUE" 
                            ? "text-red-600" 
                            : "text-amber-600"
                        }`}>
                          {p.invoice.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{p.invoice.Lease?.property?.city ?? "N/A"}</div>
                        <div className="text-xs text-slate-500">Unit {p.invoice.Lease?.unit?.unitNumber ?? "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => generateReceipt(p.id)}
                          disabled={generatingReceipt === p.id}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-medium px-4 py-2"
                        >
                          {generatingReceipt === p.id ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Generating...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Generate Receipt
                            </span>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}