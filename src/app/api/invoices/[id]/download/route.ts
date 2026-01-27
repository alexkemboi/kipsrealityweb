import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params;

    // Parse groupId (format: lease_id-date)
    const [leaseId, dateString] = decodeURIComponent(groupId).split('-');
    const dueDate = new Date(dateString);

    // Fetch all invoices for this lease and due date
    const invoices = await prisma.invoice.findMany({
      where: {
        leaseId: leaseId,
        dueDate: {
          gte: new Date(dueDate.setHours(0, 0, 0, 0)),
          lt: new Date(dueDate.setHours(23, 59, 59, 999))
        }
      },
      include: {
        InvoiceItem: true,
        payments: true,
        Lease: {
          include: {
            tenant: true,
            property: true,
            unit: true
          }
        }
      },
      orderBy: { type: 'asc' }
    });

    if (!invoices.length) {
      return NextResponse.json(
        { success: false, error: "No invoices found for this group" },
        { status: 404 }
      );
    }

    // Generate simple text content
    const textContent = generateTextContent(invoices, dateString);

    // Convert to Blob for download
    const blob = new Blob([textContent], { type: 'text/plain' });

    return new Response(blob, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="invoice-${dateString}.txt"`,
      },
    });

  } catch (error: any) {
    console.error("Error fetching combined invoice:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch combined invoice" },
      { status: 500 }
    );
  }
}

function generateTextContent(invoices: any[], dateString: string): string {
  const tenant = invoices[0]?.Lease?.tenant;
  const property = invoices[0]?.Lease?.property;
  const unit = invoices[0]?.Lease?.unit;

  // Fixed: Added proper types for reduce functions
  const totalAmount = invoices.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((sum: number, inv: any) =>
    sum + inv.payments.reduce((pSum: number, p: any) => pSum + p.amount, 0), 0
  );

  let content = `
COMBINED INVOICE
=================

Tenant: ${tenant?.firstName || 'N/A'} ${tenant?.lastName || 'N/A'}
Property: ${property?.name || 'N/A'}
Unit: ${unit?.unitNumber || 'N/A'}
Due Date: ${dateString}

INVOICE BREAKDOWN:
`;

  invoices.forEach((invoice: any) => {
    content += `
${invoice.type} INVOICE:
  Amount: USD ${invoice.totalAmount.toLocaleString()}
  Status: ${invoice.status}
  Items:${invoice.InvoiceItem.length > 0 ? '' : ' None'}
${invoice.InvoiceItem.map((item: any) => `    - ${item.description}: USD ${item.amount.toLocaleString()}`).join('\n')}
`;
  });

  content += `
SUMMARY:
========
Total Amount: $ ${totalAmount.toLocaleString()}
Total Paid: $ ${totalPaid.toLocaleString()}
Balance Due: $ ${(totalAmount - totalPaid).toLocaleString()}

Generated on: ${new Date().toLocaleDateString()}
`;

  return content;
}