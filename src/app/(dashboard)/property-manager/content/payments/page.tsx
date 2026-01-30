"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@mui/material";

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
  isReversed?: boolean;
  postingStatus: "PENDING" | "POSTED" | "FAILED";
}

interface FullReceipt {
  id: string;
  receiptNo: string;
  issuedOn: string;
  paymentId: string;
  invoiceId: string;
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

  // Payment reversal state
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [paymentToReverse, setPaymentToReverse] = useState<Payment | null>(null);
  const [reversalReason, setReversalReason] = useState("");

  // Memoized fetch functions to prevent infinite loops
  const fetchPayments = useCallback(async () => {
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
  }, [selectedProperty, selectedUnit]);

  const fetchProperties = useCallback(async () => {
    try {
      const res = await fetch("/api/propertymanager");
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data: Property[] = await res.json();
      setProperties(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load properties");
    }
  }, []);

  const fetchUnits = useCallback(async (propertyId: string) => {
    try {
      const res = await fetch(`/api/units?propertyId=${propertyId}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const data: Unit[] = await res.json();
      setUnits(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load units");
    }
  }, []);

  const fetchPendingInvoices = useCallback(async () => {
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
  }, []);

  const fetchUnitsForModal = useCallback(async (propertyId: string) => {
    try {
      const res = await fetch(`/api/units?propertyId=${propertyId}`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const data: Unit[] = await res.json();
      setModalUnits(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load units");
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchPayments();
    fetchProperties();
  }, [fetchPayments, fetchProperties]);

  // Handle property/unit filter changes
  useEffect(() => {
    if (selectedProperty) {
      fetchUnits(selectedProperty);
    } else {
      setUnits([]);
    }
  }, [selectedProperty, fetchUnits]);

  // Fetch payments when filters change
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
  }, [modalPropertyFilter, fetchUnitsForModal]);

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

    const invoice = filteredInvoices.find(inv => inv.id === selectedInvoice) ||
      pendingInvoices.find(inv => inv.id === selectedInvoice);
    if (!invoice) return toast.error("Invoice not found");

    const validPayments = invoice.payment?.filter(p => !p.isReversed) || [];
    const paidAmount = validPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.amount - paidAmount;

    if (paymentMethod === "CREDIT_CARD" && Math.abs(amount - remaining) > 0.01) {
      return toast.error(`Credit card payments must be for the full remaining balance of USD ${remaining.toFixed(2)}`);
    }

    if (paymentMethod === "CASH" && amount > remaining) {
      return toast.error(`Payment amount cannot exceed remaining balance of USD ${remaining.toFixed(2)}`);
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
          toast.success(`Partial payment of USD ${amount.toFixed(2)} recorded. Remaining: USD ${data.remaining.toFixed(2)}`);
        }
        closeRecordPaymentModal();
        await fetchPayments();
        await fetchPendingInvoices();
      } else {
        toast.error(data.error || "Failed to record payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to record payment");
    }
  }

  function openReverseModal(payment: Payment) {
    setPaymentToReverse(payment);
    setShowReverseModal(true);
  }

  function closeReverseModal() {
    setPaymentToReverse(null);
    setShowReverseModal(false);
    setReversalReason("");
  }

  async function reversePayment() {
    if (!paymentToReverse) return;

    if (!reversalReason) {
      toast.error("Please provide a reason for reversal");
      return;
    }

    try {
      const res = await fetch(`/api/payments/${paymentToReverse.id}/reversal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reversalReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reverse payment");

      toast.success("Payment reversed successfully!");

      // Close modal and refresh data
      closeReverseModal();
      await fetchPayments(); // This will refresh the payments list

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to reverse payment");
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

  // Filter out reversed payments for calculations
  const validPay = payments.filter(p => !p.isReversed);
  const totalAmount = validPay.reduce((sum, p) => sum + p.amount, 0);
  const paymentMethods = {
    CASH: validPay.filter(p => p.method === "CASH").length,
    CREDIT_CARD: validPay.filter(p => p.method === "CREDIT_CARD").length,
  };

  const selectedInvoiceData = filteredInvoices.find(inv => inv.id === selectedInvoice);
  const validPayments = selectedInvoiceData?.payment?.filter(p => !p.isReversed) || [];
  const paidSoFar = validPayments.reduce((sum, p) => sum + p.amount, 0);
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
          <div className="fixed inset-0  bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all my-8">
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
                        setPaymentAmount("");
                      }}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Choose an invoice...</option>
                      {filteredInvoices.map((inv) => {
                        const validPayments = inv.payment?.filter(p => !p.isReversed) || [];
                        const paid = validPayments.reduce((sum, p) => sum + p.amount, 0);
                        const remaining = inv.amount - paid;
                        return (
                          <option key={inv.id} value={inv.id}>
                            #{inv.id.slice(0, 8)} - {inv.type} - {inv.Lease.property.city} Unit {inv.Lease.unit.unitNumber} - Tenant: {inv.Lease.tenant.firstName} {inv.Lease.tenant.lastName} - USD {remaining.toFixed(2)} remaining
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
                        <span className="font-semibold">USD {selectedInvoiceData.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Already Paid:</span>
                        <span className="font-semibold text-emerald-600">USD {paidSoFar.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                        <span className="text-slate-700 font-medium">Remaining Balance:</span>
                        <span className="font-bold text-blue-600 text-lg">USD {remainingBalance.toFixed(2)}</span>
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
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-medium">USD</span>
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
                        Use full remaining balance (USD {remainingBalance.toFixed(2)})
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
                  <div className={`rounded-lg p-4 ${paymentMethod === "CASH"
                    ? "bg-amber-50 border border-amber-200"
                    : "bg-blue-50 border border-blue-200"
                    }`}>
                    <div className="flex gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${paymentMethod === "CASH" ? "text-amber-600" : "text-blue-600"
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className={`text-sm ${paymentMethod === "CASH" ? "text-amber-800" : "text-blue-800"
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
          <div className="fixed inset-0  bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-visible my-8">
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
                {/* Use inline styles for PDF generation - these render properly in PDFs */}
                <div style={{
                  width: '100%',
                  maxWidth: '800px',
                  margin: '0 auto',
                  backgroundColor: 'white',
                  fontFamily: 'Arial, sans-serif',
                  color: '#1a1a1a'
                }}>
                  {/* Header Section */}
                  <div style={{
                    textAlign: 'center',
                    borderBottom: '3px solid #2563eb',
                    paddingBottom: '20px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#2563eb',
                      marginBottom: '8px',
                      letterSpacing: '1px'
                    }}>
                      PAYMENT RECEIPT
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b',
                      marginTop: '8px'
                    }}>
                      Official Payment Confirmation
                    </div>
                  </div>

                  {/* Receipt Number & Date */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '30px',
                    padding: '15px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        Receipt No.
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                        {viewingReceipt.receiptNo}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        Issue Date
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                        {new Date(viewingReceipt.issuedOn).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    {/* Left Column - Tenant Info */}
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#1e293b',
                        marginBottom: '15px',
                        borderBottom: '2px solid #e2e8f0',
                        paddingBottom: '8px'
                      }}>
                        TENANT INFORMATION
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                          Name
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {viewingReceipt.payment.invoice.Lease.tenant.firstName} {viewingReceipt.payment.invoice.Lease.tenant.lastName}
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                          Email
                        </div>
                        <div style={{ fontSize: '14px', color: '#1e293b' }}>
                          {viewingReceipt.payment.invoice.Lease.tenant.email}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Property Details */}
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#1e293b',
                        marginBottom: '15px',
                        borderBottom: '2px solid #e2e8f0',
                        paddingBottom: '8px'
                      }}>
                        PROPERTY DETAILS
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                          Property
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {viewingReceipt.payment.invoice.Lease.property.city}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {viewingReceipt.payment.invoice.Lease.property.address}
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                          Unit Number
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {viewingReceipt.payment.invoice.Lease.unit.unitNumber}
                          {viewingReceipt.payment.invoice.Lease.unit.unitName &&
                            ` - ${viewingReceipt.payment.invoice.Lease.unit.unitName}`
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      marginBottom: '15px'
                    }}>
                      INVOICE DETAILS
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Invoice Number</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                        #{viewingReceipt.payment.invoice.id.slice(0, 8)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Invoice Type</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                        {viewingReceipt.payment.invoice.type}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Due Date</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                        {new Date(viewingReceipt.payment.invoice.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Invoice Amount</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                        $ {viewingReceipt.payment.invoice.amount.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Invoice Status</div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: viewingReceipt.payment.invoice.status === 'PAID' ? '#10b981' : '#f59e0b'
                      }}>
                        {viewingReceipt.payment.invoice.status}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div style={{
                    backgroundColor: '#eff6ff',
                    border: '2px solid #2563eb',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      marginBottom: '15px'
                    }}>
                      PAYMENT INFORMATION
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#002b5b' }}>Payment ID</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                        #{viewingReceipt.payment.id.slice(0, 12)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#002b5b' }}>Payment Date</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                        {new Date(viewingReceipt.payment.paidOn).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#002b5b' }}>Payment Method</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                        {viewingReceipt.payment.method === 'CASH' ? '💵 Cash' : '💳 Credit Card'}
                      </div>
                    </div>
                    {viewingReceipt.payment.reference && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#002b5b' }}>Reference Number</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                          {viewingReceipt.payment.reference}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount Paid - Prominent */}
                  <div style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '25px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginBottom: '30px'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>
                      AMOUNT PAID
                    </div>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', letterSpacing: '1px' }}>
                      $ {viewingReceipt.payment.amount.toFixed(2)}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{
                    borderTop: '2px solid #e2e8f0',
                    paddingTop: '20px',
                    marginTop: '40px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      fontSize: '11px',
                      color: '#64748b',
                      lineHeight: '1.6'
                    }}>
                      <div style={{ marginBottom: '8px', fontWeight: '600' }}>
                        Thank you for your payment!
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        This is an official receipt for the payment received.
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        Please keep this receipt for your records.
                      </div>
                      <div style={{ marginTop: '15px', fontSize: '10px', color: '#94a3b8' }}>
                        Generated on {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Verification Code */}
                  <div style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>
                      RECEIPT VERIFICATION CODE
                    </div>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      letterSpacing: '2px'
                    }}>
                      {viewingReceipt.receiptNo}-{viewingReceipt.payment.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>            </div>
          </div>
        )}

        {/* Reverse Payment Modal */}
        {showReverseModal && paymentToReverse && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Reverse Payment</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  Are you sure you want to reverse payment <span className="font-bold">#{paymentToReverse.id.slice(0, 8)}</span> of{' '}
                  <span className="font-bold">$ {paymentToReverse.amount.toFixed(2)}</span>?
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Reversal *
                </label>
                <textarea
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="Enter the reason for reversing this payment..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={closeReverseModal}
                  variant="outline"
                  className="px-4 py-2 border-2 border-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={reversePayment}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Reverse Payment
                </Button>
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
                <div className="text-2xl font-bold text-slate-800">$ {totalAmount.toFixed(2)}</div>
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
                <div className="text-2xl font-bold text-white">$ {validPayments.length > 0 ? (totalAmount / validPayments.length).toFixed(2) : '0.00'}</div>              </div>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">GL Status</th>
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
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${p.method === "CASH"
                          ? "bg-navy-100 text-green-800"
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
                        <div className={`text-xs ${p.invoice.status === "PAID"
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.postingStatus === "POSTED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                          }`}>
                          {p.postingStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-2 text-sm">
                              Actions ▾
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent className="w-48 bg-white shadow-lg border border-slate-200 rounded-lg">
                            <DropdownMenuItem
                              onClick={() => generateReceipt(p.id)}
                              className="cursor-pointer hover:bg-slate-50"
                            >
                              📄 Generate Receipt
                            </DropdownMenuItem>


                            <DropdownMenuItem
                              onClick={() => openReverseModal(p)}
                              className="cursor-pointer text-red-600 hover:bg-red-50"
                            >
                              ↩️ Reverse Payment
                            </DropdownMenuItem>


                            {p.isReversed && (
                              <DropdownMenuItem disabled className="opacity-50">
                                Already Reversed
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.isReversed
                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                            }`}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">#{p.id.slice(0, 8)}</div>
                            {p.isReversed && (
                              <div className="text-xs text-red-600 font-semibold">REVERSED</div>
                            )}
                            {p.reference && (
                              <div className="text-xs text-slate-500">Ref: {p.reference}</div>
                            )}
                          </div>
                        </div>
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