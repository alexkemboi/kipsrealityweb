"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { fetchInvoicesForTenant, downloadInvoicePDF, generateFullInvoice, generateUtilityInvoice, createManualInvoice } from "@/lib/Invoice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { fetchLeaseForTenant } from "@/lib/InvoiceLease";
import { GroupedInvoice, Invoice, Payment, InvoiceItem } from "@/app/data/FinanceData";

import { Download, FileText, Calendar, DollarSign, CreditCard, AlertCircle, Eye, Filter, ChevronDown, ChevronRight, Home, Zap, FileBarChart, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// PDF Generator function with proper null checking

async function generateCombinedInvoicePDF(groupData: any): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // === MODERN HEADER WITH COLOR ===
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(0, 0, 210, 40, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("COMBINED INVOICE", 105, 25, { align: "center" });

  let y = 55;

  // === PROPERTY & UNIT INFORMATION ===
  if (groupData.property || groupData.unit) {
    doc.setFillColor(249, 250, 251); // Light gray background
    doc.roundedRect(15, y, 180, 30, 3, 3, "F"); // Increased height to 30

    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.setFont("helvetica", "bold");
    doc.text("PROPERTY DETAILS", 25, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);

    // Determine property name based on property type
    const propertyName = getPropertyDisplayName(groupData.property);

    // Property name
    if (propertyName) {
      doc.text("Property Name: " + propertyName, 25, y + 16);
    }

    // Property address
    if (groupData.property?.address) {
      doc.setFontSize(10);
      doc.text(`Address: ${groupData.property.address}`, 25, y + 22);
      doc.setFontSize(12);
    }

    // Unit information on the right side - MORE PROMINENT
    if (groupData.unit?.unitNumber) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246); // Blue color for unit
      doc.text(`Unit: ${groupData.unit.unitNumber}`, 140, y + 16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);
    }

    y += 40; // Increased spacing
  }

  // === BILLED TO SECTION ===
  doc.setFillColor(249, 250, 251); // Light gray background
  doc.roundedRect(15, y, 180, 25, 3, 3, "F");

  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "bold");
  doc.text("BILLED TO", 25, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(31, 41, 55);

  // Tenant name
  if (groupData.tenant?.firstName || groupData.tenant?.lastName) {
    doc.text(`${groupData.tenant?.firstName || ""} ${groupData.tenant?.lastName || ""}`.trim(), 25, y + 16);
  }

  // Billing period on the right side
  doc.text(`Billing Period: ${formatGroupDate(groupData.dueDate)}`, 120, y + 16);

  y += 35;

  // === INVOICE BREAKDOWN SECTION ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text("INVOICE BREAKDOWN", 20, y);

  y += 12;

  // Table Header
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(20, y, 170, 10, 2, 2, "F");

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE TYPE", 25, y + 7);
  doc.text("AMOUNT", 100, y + 7);
  doc.text("STATUS", 150, y + 7);

  y += 15;

  // Invoice Items
  (groupData.invoices || []).forEach((invoice: any, index: number) => {
    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(20, y - 4, 170, 8, 'F');
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text(`${invoice.type}`, 25, y);

    doc.setFont("helvetica", "normal");
    doc.text(`$ ${invoice.amount?.toLocaleString() || "0"}`, 100, y);

    // Status with color coding
    const status = invoice.status?.toLowerCase();
    if (status === "paid") {
      doc.setTextColor(34, 197, 94); // Green
    } else if (status === "overdue") {
      doc.setTextColor(239, 68, 68); // Red
    } else {
      doc.setTextColor(245, 158, 11); // Yellow
    }
    doc.text(status?.toUpperCase() || "PENDING", 150, y);

    doc.setTextColor(31, 41, 55); // Reset color
    y += 8;

    // === UTILITY BREAKDOWN (for utility invoices) ===
    if (invoice.type === "UTILITY" && invoice.utilities?.length > 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Utility Details:", 28, y);
      y += 5;

      invoice.utilities.forEach((u: any, utilIndex: number) => {
        const utilType = u.type?.toUpperCase() === "METERED" ? "METERED" : "FIXED";
        let line = `• ${u.name} (${utilType})`;

        if (utilType === "FIXED" && u.fixedAmount) {
          line += ` - $ ${u.fixedAmount.toLocaleString()}`;
        } else if (utilType === "METERED" && u.unitPrice) {
          line += ` - $ ${u.unitPrice.toLocaleString()}/unit`;
        }

        doc.setFont("helvetica", "normal");
        doc.text(line, 30, y);
        y += 4;
      });
      y += 4;
    }

    y += 8; // Space between invoices

    // Page break check
    if (y > 250) {
      doc.addPage();
      y = 30;
      // Recreate table header on new page
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(20, y, 170, 10, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("INVOICE TYPE", 25, y + 7);
      doc.text("AMOUNT", 100, y + 7);
      doc.text("STATUS", 150, y + 7);
      y += 15;
    }
  });

  // === SIMPLIFIED PAYMENT SUMMARY ===
  y += 10;

  // Summary header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text("PAYMENT SUMMARY", 20, y);
  y += 15;

  // White background summary card - Only Balance Due
  const balanceDue = (groupData.totalAmount || 0) - (groupData.totalPaid || 0);

  doc.setFillColor(255, 255, 255); // White background
  doc.roundedRect(20, y - 5, 170, 20, 5, 5, "F");

  doc.setDrawColor(226, 232, 240); // Light border
  doc.setLineWidth(0.5);
  doc.roundedRect(20, y - 5, 170, 20, 5, 5, "S");

  // Only show Balance Due
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.text("BALANCE DUE:", 30, y + 5);

  doc.setTextColor(239, 68, 68); // Red color for balance due
  doc.text(`$ ${balanceDue.toLocaleString()}`, 150, y + 5, { align: "right" });

  y += 30;

  // === PAYMENT INSTRUCTIONS ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  doc.text("PAYMENT INSTRUCTIONS", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);

  const instructions = [
    "• Please pay the balance due by the billing period end date",
    "• Late payments may incur additional charges",
    "• Contact property management for payment issues",
    "• Keep this invoice for your records"
  ];

  instructions.forEach((instruction, index) => {
    doc.text(instruction, 25, y + (index * 5));
  });

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 285, 190, 285);

    // Footer text
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Generated on ${new Date().toLocaleDateString()} • Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    doc.text("Thank you for your business!", 105, 295, { align: "center" });
  }

  return doc.output("blob");
}

// Helper function to determine property display name
function getPropertyDisplayName(property: any): string {
  if (!property) return "";

  // Check for apartment complex building name first
  if (property.apartmentComplexDetail?.buildingName) {
    return property.apartmentComplexDetail.buildingName;
  }

  // Check for house name second
  if (property.houseDetail?.houseName) {
    return property.houseDetail.houseName;
  }

  // Fallback to generic property name or address
  return property.name || property.address || "Property";
}



// Helper function for date formatting in PDF


// Combined PDF download function with better error handling
async function downloadCombinedInvoicePDF(groupData: any, groupId: string) {
  try {
    // Validate data before generating PDF
    if (!groupData || !groupData.invoices || groupData.invoices.length === 0) {
      throw new Error("No invoice data available for PDF generation");
    }

    const pdfBlob = await generateCombinedInvoicePDF(groupData);

    // Download the PDF
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${groupData.tenant?.firstName || ""} ${groupData.tenant?.lastName || ""}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error generating combined invoice PDF:", error);
    throw error;
  }
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-navy-100 text-green-800 border-navy-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function formatCurrency(amount: number) {
  return `$ ${Number(amount).toLocaleString()}`;
}

function formatDate(dateString: string) {
  if (!dateString || dateString === "no-date") return "No Due Date";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatGroupDate(dateKey: string) {
  if (!dateKey || dateKey === "no-date") return "No Due Date";
  return new Date(dateKey).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Helper function to calculate invoice balance
function calculateInvoiceBalance(invoice: Invoice): number {
  const payments = invoice.payment || [];
  const totalPaid = payments.reduce((sum: number, payment: Payment) =>
    sum + (payment.amount || 0), 0);
  return (invoice.amount || 0) - totalPaid;
}

// Helper function to calculate group balance
function calculateGroupBalance(group: GroupedInvoice): number {
  const totalPaid = group.invoices.reduce((sum, invoice) => {
    const payments = invoice.payment || [];
    const invoicePaid = payments.reduce((paymentSum: number, payment: Payment) =>
      paymentSum + (payment.amount || 0), 0);
    return sum + invoicePaid;
  }, 0);

  return (group.totalAmount || 0) - totalPaid;
}

// Helper function to calculate total paid for a group
function calculateGroupTotalPaid(group: GroupedInvoice): number {
  return group.invoices.reduce((sum, invoice) => {
    const payments = invoice.payment || [];
    const invoicePaid = payments.reduce((paymentSum: number, payment: Payment) =>
      paymentSum + (payment.amount || 0), 0);
    return sum + invoicePaid;
  }, 0);
}

// Helper function to determine group status
function getGroupStatus(group: GroupedInvoice): string {
  const balance = calculateGroupBalance(group);
  const dueDate = group.date === "no-date" ? null : new Date(group.date);
  const today = new Date();

  if (balance <= 0) return "paid";
  if (dueDate && dueDate < today) return "overdue";
  return "pending";
}

export default function TenantInvoicesPage() {
  const params = useParams();
  const tenantId = (params as any).tenantId;

  const [groupedInvoices, setGroupedInvoices] = useState<GroupedInvoice[]>([]);
  const [lease, setLease] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualAmount, setManualAmount] = useState<number | "">("");
  const [manualDate, setManualDate] = useState("");
  const [manualType, setManualType] = useState<"RENT" | "UTILITY">("RENT");
  const [loadingManual, setLoadingManual] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchInvoicesForTenant(tenantId);
        setGroupedInvoices(data);
        const tenantLease = await fetchLeaseForTenant(tenantId);
        setLease(tenantLease);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId]);

  // Filter grouped invoices by status
  const filteredGroups = useMemo(() => {
    if (statusFilter === "all") return groupedInvoices;

    return groupedInvoices.filter(group => {
      const groupStatus = getGroupStatus(group);
      return groupStatus === statusFilter.toLowerCase();
    });
  }, [groupedInvoices, statusFilter]);

  // Calculate financial summary from grouped invoices
  const financialSummary = useMemo(() => {
    const totalBilled = filteredGroups.reduce((sum, group) => sum + (group.totalAmount || 0), 0);

    const totalPaid = filteredGroups.reduce((sum, group) => {
      return sum + calculateGroupTotalPaid(group);
    }, 0);

    const balance = totalBilled - totalPaid;

    return { totalBilled, totalPaid, balance };
  }, [filteredGroups]);

  // Calculate total invoice count across all groups
  const totalInvoiceCount = useMemo(() => {
    return filteredGroups.reduce((count, group) => count + group.invoices.length, 0);
  }, [filteredGroups]);

  const handleGenerateUtilityInvoice = async () => {
    if (!lease) return toast.error("Tenant lease not found");

    try {
      toast.loading("Generating Utility Invoice...");
      await generateUtilityInvoice(lease.id);
      toast.dismiss();
      toast.success("Utility Invoice Created!");
      setGroupedInvoices(await fetchInvoicesForTenant(tenantId));
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Failed to generate utility invoice");
    }
  };

  const handleCreateManualInvoice = async () => {
    if (!lease) return toast.error("Tenant lease not found");

    try {
      setLoadingManual(true);
      toast.loading("Creating invoice...");

      await createManualInvoice({
        leaseId: lease.id,
        type: manualType,
        amount: Number(manualAmount),
        dueDate: manualDate,
      });

      toast.dismiss();
      toast.success("Manual invoice created!");
      setGroupedInvoices(await fetchInvoicesForTenant(tenantId));
      setShowManualModal(false);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message);
    } finally {
      setLoadingManual(false);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-8 bg-gray-300" />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="px-6 py-4 text-left">
                      <Skeleton className="h-4 w-20 bg-gray-300" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row} className="border-b border-gray-100">
                    {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                      <td key={cell} className="px-6 py-4">
                        <Skeleton className="h-4 w-24 bg-gray-300" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tenant Billing</h1>
            <p className="text-gray-600">View and manage all your invoices and payments</p>
          </div>
          {groupedInvoices.length > 0 && (
            <div className="mt-4 lg:mt-0 flex gap-4 items-center">
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Billing Periods</div>
                <div className="text-2xl font-bold text-gray-900">{filteredGroups.length}</div>
              </div>
              <div className="bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">Total Invoices</div>
                <div className="text-2xl font-bold text-gray-900">{totalInvoiceCount}</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Summary */}
        {groupedInvoices.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200 min-w-32">
                  <div className="text-sm text-gray-600 mb-1">Total Billed</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(financialSummary.totalBilled)}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200 min-w-32">
                  <div className="text-sm text-gray-600 mb-1">Total Paid</div>
                  <div className="text-lg font-bold text-navy-700">
                    {formatCurrency(financialSummary.totalPaid)}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200 min-w-32">
                  <div className="text-sm text-gray-600 mb-1">Balance</div>
                  <div className={`text-lg font-bold ${financialSummary.balance > 0 ? "text-red-600" : "text-navy-700"
                    }`}>
                    {formatCurrency(financialSummary.balance)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6">
          <Button
            onClick={async () => {
              if (!lease) return toast.error("Tenant lease not found");
              try {
                toast.loading("Generating Full Invoice...");
                await generateFullInvoice({ leaseId: lease.id, type: "RENT" });
                toast.dismiss();
                toast.success("Full Invoice Created!");
                setGroupedInvoices(await fetchInvoicesForTenant(tenantId));
              } catch (err: any) {
                toast.dismiss();
                toast.error(err.message || "Failed to generate full invoice");
              }
            }}
            className="bg-blue-600 text-white mr-4 mb-4"
          >
            Generate Full Invoice
          </Button>

          <Button
            onClick={handleGenerateUtilityInvoice}
            className="bg-blue-600 text-white mr-4"
          >
            Generate Utility Invoice
          </Button>

          <Button
            className="bg-blue-600 text-white"
            onClick={() => setShowManualModal(true)}
          >
            Create Manual Invoice
          </Button>
        </div>

        {/* COMBINED INVOICES TABLE */}
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 py-16 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {statusFilter === "all" ? "No invoices found" : "No invoices match the filter"}
            </h3>
            <p className="text-gray-600">
              {statusFilter === "all"
                ? "There are no invoices available for this tenant."
                : `No invoices with status "${statusFilter}" found.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Billing Period</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice Types</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount Paid</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Balance Due</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGroups.map((group, index) => {
                  const groupId = `group-${group.leaseId}-${group.date}-${index}`;
                  const isGroupExpanded = expandedGroups.has(groupId);
                  const groupBalance = calculateGroupBalance(group);
                  const groupTotalPaid = calculateGroupTotalPaid(group);
                  const groupStatus = getGroupStatus(group);

                  // Separate invoices by type for display
                  const rentInvoice = group.invoices.find((inv: Invoice) => inv.type === "RENT");
                  const utilityInvoice = group.invoices.find((inv: Invoice) => inv.type === "UTILITY");

                  // Prepare data for combined PDF
                  const combinedInvoiceData = {
                    leaseId: group.leaseId,
                    dueDate: group.date, // Use group.date here
                    invoices: group.invoices || [],
                    totalAmount: group.totalAmount || 0,
                    totalPaid: groupTotalPaid || 0,
                    tenant: group.tenant || {},    // directly from group
                    property: group.property || {}, // directly from group
                    unit: group.unit || {},
                  };

                  return (
                    <React.Fragment key={groupId}>
                      {/* GROUP HEADER ROW */}
                      <tr className="bg-blue-50 border-b border-blue-100">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-semibold text-gray-900">
                                {formatGroupDate(group.date)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {group.invoices.length} invoice(s)
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {rentInvoice && (
                              <div className="flex items-center gap-1">
                                <Home className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-700">Rent</span>
                              </div>
                            )}
                            {utilityInvoice && (
                              <div className="flex items-center gap-1">
                                <Zap className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium text-orange-700">Utilities</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(group.totalAmount)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <span className="font-semibold text-navy-700">
                              {formatCurrency(groupTotalPaid)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 ${groupBalance > 0 ? "text-red-600" : "text-navy-700"
                            }`}>
                            <AlertCircle className={`h-4 w-4 ${groupBalance > 0 ? "text-red-500" : "text-navy-700"
                              }`} />
                            <span className="font-semibold">
                              {formatCurrency(groupBalance)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getStatusColor(groupStatus)}>
                            {groupStatus.charAt(0).toUpperCase() + groupStatus.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => toggleGroupExpansion(groupId)}
                            >
                              <Eye className="h-4 w-4" />
                              {isGroupExpanded ? "Hide" : "Details"}
                            </Button>

                            {/* Combined PDF Download Button */}
                            <Button
                              size="sm"
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  setDownloadingId(`combined-${groupId}`);
                                  await downloadCombinedInvoicePDF(combinedInvoiceData, `${group.leaseId}-${group.date}`);
                                  toast.success("Combined PDF downloaded successfully");
                                } catch (error: any) {
                                  toast.error(error.message || "Failed to download combined PDF");
                                } finally {
                                  setDownloadingId(null);
                                }
                              }}
                              disabled={downloadingId === `combined-${groupId}`}
                            >
                              <Download className="h-4 w-4" />
                              Combined PDF
                            </Button>

                            <Link href={"/map"}>
                              <Button>Maps</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDED DETAILS ROW */}
                      {isGroupExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="space-y-6">
                              {/* Invoice Breakdown */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Invoice Breakdown</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Rent Invoice Details */}
                                  {rentInvoice && (
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <Home className="h-4 w-4 text-blue-600" />
                                          <span className="font-semibold text-blue-900">Rent Invoice</span>
                                        </div>
                                        <Badge className={getStatusColor(rentInvoice.status)}>
                                          {rentInvoice.status}
                                        </Badge>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">Amount:</span>
                                          <span className="font-semibold">{formatCurrency(rentInvoice.amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">Balance:</span>
                                          <span className={`font-semibold ${calculateInvoiceBalance(rentInvoice) > 0 ? "text-red-600" : "text-navy-700"
                                            }`}>
                                            {formatCurrency(calculateInvoiceBalance(rentInvoice))}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Utility Invoice Details */}
                                  {utilityInvoice && (
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <Zap className="h-4 w-4 text-orange-600" />
                                          <span className="font-semibold text-orange-900">Utilities Invoice</span>
                                        </div>
                                        <Badge className={getStatusColor(utilityInvoice.status)}>
                                          {utilityInvoice.status}
                                        </Badge>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">Amount:</span>
                                          <span className="font-semibold">{formatCurrency(utilityInvoice.amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">Balance:</span>
                                          <span className={`font-semibold ${calculateInvoiceBalance(utilityInvoice) > 0 ? "text-red-600" : "text-navy-700"
                                            }`}>
                                            {formatCurrency(calculateInvoiceBalance(utilityInvoice))}
                                          </span>
                                        </div>
                                        {utilityInvoice.utilities && utilityInvoice.utilities.length > 0 && (
                                          <div className="mt-2">
                                            <div className="text-xs font-medium text-gray-600 mb-1">Utility Details:</div>
                                            {utilityInvoice.utilities.map((u) => (
                                              <div key={u.id} className="flex justify-between text-xs">
                                                <span className="text-gray-500">{u.name} ({u.type})</span>
                                                <span>
                                                  {u.fixedAmount !== undefined ? `Fixed: ${formatCurrency(u.fixedAmount)}` : ''}
                                                  {u.unitPrice !== undefined ? ` • Unit Price: ${formatCurrency(u.unitPrice)}` : ''}
                                                  {u.isTenantResponsible !== undefined ? ` • Tenant Responsible: ${u.isTenantResponsible ? "Yes" : "No"}` : ''}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}


                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Combined Payment History */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-navy-700" />
                                  Payment History
                                </h4>
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="space-y-2">
                                    {group.invoices.flatMap((invoice: Invoice) => invoice.payment || []).length > 0 ? (
                                      group.invoices.flatMap((invoice: Invoice) => invoice.payment || []).map((payment: Payment) => (
                                        <div key={payment.id} className="flex justify-between items-center p-3 bg-navy-50 rounded border border-navy-200">
                                          <div>
                                            <div className="font-medium text-gray-900 capitalize">
                                              {payment.method} Payment
                                            </div>
                                            <div className="text-sm text-gray-500">
                                              {payment.reference && `Ref: ${payment.reference}`}
                                              {payment.paidOn && ` • ${formatDate(payment.paidOn)}`}
                                            </div>
                                          </div>
                                          <span className="font-semibold text-navy-700">
                                            {formatCurrency(payment.amount)}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-sm text-gray-500 italic p-3 bg-white rounded border border-gray-200">
                                        No payments recorded for this billing period
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Manual Invoice Modal */}
        {showManualModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg w-full max-w-md relative">
              <button
                onClick={() => setShowManualModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              <h2 className="text-xl text-blue-500 font-semibold mb-4">Create Manual Invoice</h2>

              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as "RENT" | "UTILITY")}
                className="w-full border p-2 rounded mb-3"
              >
                <option value="RENT">Rent</option>
                <option value="UTILITY">Utility</option>
              </select>

              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(Number(e.target.value))}
                className="w-full border p-2 rounded mb-3"
              />

              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full border p-2 rounded mb-4"
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowManualModal(false)}>
                  Cancel
                </Button>

                <Button
                  variant="outline"
                  disabled={loadingManual}
                  onClick={handleCreateManualInvoice}
                >
                  {loadingManual ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}