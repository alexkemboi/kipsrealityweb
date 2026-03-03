"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

// Types
interface Receipt { id: string; receiptNo: string; issuedOn: string; paymentId: string; payment: Payment; invoiceId: string; }
interface Payment { id: string; amount: number; method: string; reference?: string; paidOn?: string; isReversed?: boolean; invoice: Invoice; receipt?: Receipt[]; }
interface Lease {
  id: string;
  property: Property;
  unit: Unit;
  tenant: Tenant;
}
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
  email?: string;
}
interface Invoice { id: string; leaseId: string; amount: number; dueDate: string; status: "PENDING" | "PAID" | "OVERDUE"; type: string; Lease: Lease; payment: Payment[]; }

export default function TenantInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);


  useEffect(() => { fetchInvoices(); }, []);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/tenant`);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      // Ensure data is always an array, even if API returns null/undefined
      const normalizedInvoices = Array.isArray(data) ? data : [];
      
      // Transform invoices to match frontend interface
      // Backend returns 'payments' but frontend expects 'payment'
      const transformedInvoices = normalizedInvoices.map(invoice => ({
        ...invoice,
        // Use 'payments' from backend if available, otherwise empty array
        payment: invoice.payments || invoice.payment || [],
        // Remove duplicate 'payments' field to avoid confusion
        ...(invoice.payments && { payments: undefined })
      }));
      
      setInvoices(transformedInvoices);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch invoices");
      setInvoices([]); // Set to empty array on error too
    } finally { setLoading(false); }
  }

  async function payInvoice(invoiceId: string) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return toast.error("Invoice not found");

    // Only consider non-reversed payments
    const validPayments = invoice.payment?.filter(p => !p.isReversed) || [];
    const paidAmount = validPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.amount - paidAmount;

    if (remaining <= 0) return toast.error("Invoice already fully paid");

    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: remaining,
          method: "CREDIT_CARD",
          reference
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Payment successful");
        setShowPaymentModal(false);
        setPayingInvoice(null);
        setReference("");
        await fetchInvoices();
      } else {
        toast.error(data.error || "Payment failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment failed");
    }
  }

  function openPaymentModal(invoiceId: string) {
    setPayingInvoice(invoiceId);
    setShowPaymentModal(true);
  }

  function closePaymentModal() {
    setShowPaymentModal(false);
    setPayingInvoice(null);
    setReference("");
  }

  async function viewReceipt(paymentId: string) {
    try {
      const res = await fetch(`/api/receipt/${paymentId}`);
      if (!res.ok) throw new Error("Receipt not found");
      const receipt: Receipt = await res.json();
      setViewingReceipt(receipt); // store receipt for modal
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch receipt";
      toast.error(errorMessage);
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


  const summary = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === "PENDING").length,
    overdue: invoices.filter(i => i.status === "OVERDUE").length,
    paid: invoices.filter(i => i.status === "PAID").length,
    totalAmount: invoices.reduce((sum, inv) => {
      const paidAmount = inv.payment?.filter(p => !p.isReversed).reduce((s, p) => s + p.amount, 0) || 0;
      return sum + (inv.amount - paidAmount);
    }, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">My Invoices</h1>
          <p className="text-slate-600">Manage and track your rental payments</p>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && payingInvoice && (
          <div className="fixed inset-0  bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Make Payment</h2>
                  <button
                    onClick={closePaymentModal}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                {(() => {
                  const invoice = invoices.find(i => i.id === payingInvoice);
                  if (!invoice) return null;
                  const paidAmount = invoice.payment?.filter(p => !p.isReversed).reduce((sum, p) => sum + p.amount, 0) || 0;
                  const remaining = invoice.amount - paidAmount;

                  return (
                    <>
                      {/* Invoice Details */}
                      <div className="bg-slate-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">Invoice #</span>
                          <span className="font-semibold text-slate-900">{invoice.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">Type</span>
                          <span className="font-medium text-slate-900">{invoice.type}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-600">Due Date</span>
                          <span className="font-medium text-slate-900">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="border-t border-slate-200 mt-3 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-semibold text-slate-700">Balance Remaining</span>
                            <span className="text-2xl font-bold text-blue-600">$ {remaining.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info Banner */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex gap-3">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Online Credit Card Payment</p>
                            <p className="text-blue-700">You can pay the remaining balance using your credit card. For cash payments or partial payments, please contact the property manager.</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                          <div className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 text-slate-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="font-medium">💳 Credit Card</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction Reference (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g., Card Transaction ID"
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>


              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex gap-3">
                <Button
                  onClick={closePaymentModal}
                  variant="outline"
                  className="flex-1 py-3 border-2 border-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => payingInvoice && payInvoice(payingInvoice)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
                >
                  Pay Full Amount
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
                          {viewingReceipt.payment.invoice.Lease.tenant?.firstName ?? ''} {viewingReceipt.payment.invoice.Lease.tenant?.lastName ?? ''}
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>
                          Email
                        </div>
                        <div style={{ fontSize: '14px', color: '#1e293b' }}>
                          {viewingReceipt.payment.invoice.Lease.tenant?.email || 'N/A'}
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
                        {viewingReceipt.payment.paidOn
                          ? new Date(viewingReceipt.payment.paidOn).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'N/A'}
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



        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-slate-600 mb-1">Total Invoices</div>
            <div className="text-3xl font-bold text-slate-800">{summary.total}</div>
          </div>
          <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-amber-800 mb-1">Pending</div>
            <div className="text-3xl font-bold text-amber-600">{summary.pending}</div>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-red-800 mb-1">Overdue</div>
            <div className="text-3xl font-bold text-red-600">{summary.overdue}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-emerald-800 mb-1">Outstanding</div>
            <div className="text-2xl font-bold text-emerald-600">$ {summary.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                <p className="text-slate-600">Loading invoices...</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm mt-1">Your invoices will appear here once generated</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Paid</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {invoices.map((inv) => {
                    const paidAmount = inv.payment?.filter(p => !p.isReversed).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
                    const remaining = inv.amount - paidAmount;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">#{inv.id.slice(0, 8)}</div>
                          <div className="text-xs text-slate-500">{inv.leaseId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{inv.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900">$ {inv.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-700">{new Date(inv.dueDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${inv.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.status === "OVERDUE"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-700">$ {paidAmount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            $ {remaining.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            {/* Show Pay Now button only if invoice is pending */}
                            {inv.status === "PENDING" && (
                              <Button
                                onClick={() => openPaymentModal(inv.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                              >
                                Pay Now
                              </Button>
                            )}

                            {/* Show View Receipt for any payment that has receipts */}
                            {inv.payment
                              ?.filter(pmt => pmt.receipt && pmt.receipt.length > 0)
                              .map(pmt =>
                                pmt.receipt!.map(rcpt => (
                                  <Button
                                    key={rcpt.id}
                                    onClick={() => viewReceipt(pmt.id)}
                                    variant="outline"
                                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                  >
                                    View Receipt
                                  </Button>
                                ))
                              ) || []
                            }
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
