
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
  payment?: Payment[];
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
  
  // Recording payment modal
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CREDIT_CARD">("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  
  // Modal filters
  const [modalPropertyFilter, setModalPropertyFilter] = useState<string>("");
  const [modalUnitFilter, setModalUnitFilter] = useState<string>("");
  const [modalUnits, setModalUnits] = useState<Unit[]>([]);

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

  async function fetchPendingInvoices() {
    try {
      const res = await fetch("/api/invoices?status=PENDING,OVERDUE");
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data: Invoice[] = await res.json();
      setPendingInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load pending invoices");
    }
  }

  // Filter invoices when modal filters change
  useEffect(() => {
    let filtered = pendingInvoices;
    
    if (modalPropertyFilter) {
      filtered = filtered.filter(inv => inv.Lease.property.id === modalPropertyFilter);
    }
    
    if (modalUnitFilter) {
      filtered = filtered.filter(inv => inv.Lease.unit.unitNumber === modalUnitFilter);
    }
    
    setFilteredInvoices(filtered);
  }, [modalPropertyFilter, modalUnitFilter, pendingInvoices]);

  // Fetch units for modal property filter
  useEffect(() => {
    if (modalPropertyFilter) {
      fetchUnitsForModal(modalPropertyFilter);
    } else {
      setModalUnits([]);
      setModalUnitFilter("");
    }
  }, [modalPropertyFilter]);

  async function fetchUnitsForModal(propertyId: string) {
    try {
      const res = await fetch(`/api/units?propertyId=${propertyId}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const data: Unit[] = await res.json();
      setModalUnits(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load units");
    }
  }

  function openRecordPaymentModal() {
    setShowRecordPaymentModal(true);
    fetchPendingInvoices();
  }

  function closeRecordPaymentModal() {
    setShowRecordPaymentModal(false);
    setSelectedInvoice("");
    setPaymentAmount("");
    setPaymentMethod("CASH");
    setPaymentReference("");
    setModalPropertyFilter("");
    setModalUnitFilter("");
    setModalUnits([]);
  }

  async function recordPayment() {
    if (!selectedInvoice) return toast.error("Please select an invoice");
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return toast.error("Please enter a valid amount");

    // Recalculate with the current state to ensure accuracy
    const invoice = filteredInvoices.find(inv => inv.id === selectedInvoice) || 
                    pendingInvoices.find(inv => inv.id === selectedInvoice);
    if (!invoice) return toast.error("Invoice not found");

    const paidAmount = invoice.payment?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const remaining = invoice.amount - paidAmount;

    // Validate partial payments
    if (paymentMethod === "CREDIT_CARD" && Math.abs(amount - remaining) > 0.01) {
      return toast.error(`Credit card payments must be for the full remaining balance of KES ${remaining.toFixed(2)}`);
    }

    if (paymentMethod === "CASH" && amount > remaining) {
      return toast.error(`Payment amount cannot exceed remaining balance of KES ${remaining.toFixed(2)}`);
    }

    try {
      const res = await fetch(`/api/invoices/${selectedInvoice}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: paymentMethod,
          reference: paymentReference || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const isPaidInFull = data.status === "PAID";
        if (isPaidInFull) {
          toast.success(`Payment recorded successfully! Invoice is now fully paid.`);
        } else {
          toast.success(`Partial payment of KES ${amount.toFixed(2)} recorded. Remaining: KES ${data.remaining.toFixed(2)}`);
        }
        closeRecordPaymentModal();
        await fetchPayments(); // Refresh payments
        await fetchPendingInvoices(); // Refresh pending invoices
      } else {
        toast.error(data.error || "Failed to record payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to record payment");
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

      const element = document.getElementById('receipt-content');
      if (!element) return toast.error('Receipt content not found');

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.background = 'white';
      document.body.appendChild(container);

      const cloned = element.cloneNode(true) as HTMLElement;
      cloned.style.transform = 'scale(1)';
      cloned.style.opacity = '1';
      container.appendChild(cloned);

      const allElements = cloned.querySelectorAll<HTMLElement>('*');
      allElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        ['backgroundColor', 'color', 'borderColor'].forEach(prop => {
          const value = styles.getPropertyValue(prop);
          if (value.includes('oklch')) {
            el.style.setProperty(prop, '#ffffff', 'important');
          }
        });
      });

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
    CREDIT_CARD: payments.filter(p => p.method === "CREDIT_CARD").length,
  };

  // Calculate remaining balance for selected invoice
  const selectedInvoiceData = filteredInvoices.find(inv => inv.id === selectedInvoice);
  const paidSoFar = selectedInvoiceData?.payment?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remainingBalance = selectedInvoiceData ? selectedInvoiceData.amount - paidSoFar : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Payment Records</h1>
            <p className="text-slate-600">Track and manage all rental payments</p>
          </div>
          <Button 
            onClick={openRecordPaymentModal}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Record Payment
          </Button>
        </div>

        {/* Record Payment Modal */}
        {showRecordPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Record Payment</h2>
                  <button 
                    onClick={closeRecordPaymentModal}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-5">
                  {/* Filter Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter Invoices
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-blue-900 mb-1.5">Property</label>
                        <select
                          value={modalPropertyFilter}
                          onChange={(e) => setModalPropertyFilter(e.target.value)}
                          className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="">All Properties</option>
                          {properties.map((p) => (
                            <option key={p.id} value={p.id}>{p.city} - {p.address}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-900 mb-1.5">Unit</label>
                        <select
                          value={modalUnitFilter}
                          onChange={(e) => setModalUnitFilter(e.target.value)}
                          disabled={!modalPropertyFilter}
                          className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-blue-100 disabled:cursor-not-allowed"
                        >
                          <option value="">All Units</option>
                          {modalUnits.map((u) => (
                            <option key={u.id} value={u.unitNumber}>
                              {u.unitNumber} {u.unitName ? `- ${u.unitName}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {(modalPropertyFilter || modalUnitFilter) && (
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-blue-700">
                          Showing {filteredInvoices.length} of {pendingInvoices.length} invoices
                        </span>
                        <button
                          onClick={() => {
                            setModalPropertyFilter("");
                            setModalUnitFilter("");
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Select Invoice */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Invoice *</label>
                    <select
                      value={selectedInvoice}
                      onChange={(e) => {
                        setSelectedInvoice(e.target.value);
                        setPaymentAmount(""); // Reset amount when invoice changes
                      }}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Choose an invoice...</option>
                      {filteredInvoices.map((inv) => {
                        const paid = inv.payment?.reduce((sum, p) => sum + p.amount, 0) || 0;
                        const remaining = inv.amount - paid;
                        return (
                          <option key={inv.id} value={inv.id}>
                            #{inv.id.slice(0, 8)} - {inv.type} - {inv.Lease.property.city} Unit {inv.Lease.unit.unitNumber} - Tenant: {inv.Lease.tenant.firstName} {inv.Lease.tenant.lastName} - KES {remaining.toFixed(2)} remaining
                          </option>
                        );
                      })}
                    </select>
                    {filteredInvoices.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        No pending invoices found with current filters. Try adjusting your filters.
                      </p>
                    )}
                  </div>

                  {/* Show invoice details when selected */}
                  {selectedInvoiceData && (
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Invoice Amount:</span>
                        <span className="font-semibold">KES {selectedInvoiceData.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Already Paid:</span>
                        <span className="font-semibold text-emerald-600">KES {paidSoFar.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                        <span className="text-slate-700 font-medium">Remaining Balance:</span>
                        <span className="font-bold text-blue-600 text-lg">KES {remainingBalance.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method *</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value as "CASH" | "CREDIT_CARD");
                        // Auto-fill full amount for credit card
                        if (e.target.value === "CREDIT_CARD" && selectedInvoiceData) {
                          setPaymentAmount(remainingBalance.toString());
                        }
                      }}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="CASH">💵 Cash</option>
                      <option value="CREDIT_CARD">💳 Credit Card</option>
                    </select>
                  </div>

                  {/* Payment Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Payment Amount * 
                      {paymentMethod === "CREDIT_CARD" && (
                        <span className="text-xs font-normal text-slate-500 ml-2">(Must be full balance)</span>
                      )}
                      {paymentMethod === "CASH" && (
                        <span className="text-xs font-normal text-slate-500 ml-2">(Partial payments allowed)</span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-medium">KES</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={remainingBalance}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        readOnly={paymentMethod === "CREDIT_CARD"}
                        placeholder="0.00"
                        className="w-full border border-slate-300 rounded-lg pl-16 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                      />
                    </div>
                    {paymentMethod === "CASH" && remainingBalance > 0 && (
                      <button
                        type="button"
                        onClick={() => setPaymentAmount(remainingBalance.toString())}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1 font-medium"
                      >
                        Use full remaining balance (KES {remainingBalance.toFixed(2)})
                      </button>
                    )}
                  </div>

                  {/* Reference */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Reference Number
                      <span className="text-xs font-normal text-slate-500 ml-2">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g., Receipt number, transaction ID"
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Info message */}
                  <div className={`rounded-lg p-4 ${
                    paymentMethod === "CASH" 
                      ? "bg-amber-50 border border-amber-200" 
                      : "bg-blue-50 border border-blue-200"
                  }`}>
                    <div className="flex gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        paymentMethod === "CASH" ? "text-amber-600" : "text-blue-600"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className={`text-sm ${
                        paymentMethod === "CASH" ? "text-amber-800" : "text-blue-800"
                      }`}>
                        {paymentMethod === "CASH" ? (
                          <>
                            <p className="font-semibold mb-1">Cash Payment</p>
                            <p>You can record partial payments. The invoice will remain open until fully paid.</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold mb-1">Credit Card Payment</p>
                            <p>Credit card payments must be for the full remaining balance.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex gap-3">
                <Button 
                  onClick={closeRecordPaymentModal}
                  variant="outline"
                  className="flex-1 py-3 border-2 border-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={recordPayment}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
                >
                  Record Payment
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {viewingReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-visible">
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

              <div className="p-8" id="receipt-content">
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
                    }                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-center">
                  <div className="text-white text-sm font-medium mb-2">Amount Paid</div>
                  <div className="text-white text-5xl font-bold">KES {viewingReceipt.payment.amount.toFixed(2)}</div>
                </div>

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
                  Cash: {paymentMethods.CASH} | Card: {paymentMethods.CREDIT_CARD}
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
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {p.method === "CASH" && "💵"}
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