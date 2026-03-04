import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/decimal-utils";
import type { Prisma } from "@prisma/client";

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    InvoiceItem: true;
    payments: true;
    Lease: {
      include: {
        tenant: true;
        property: true;
        unit: true;
      };
    };
  };
}>;

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Parse id (format: lease_id-date)
    const [leaseId, dateString] = decodeURIComponent(id).split('-');
    const dueDate = new Date(dateString);

    // Fetch all invoices for this lease and due date
    const rawInvoices = await prisma.invoice.findMany({
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

    const invoices: InvoiceWithRelations[] = rawInvoices;

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

  } catch (error: unknown) {
    console.error("Error fetching combined invoice:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch combined invoice";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function generateTextContent(invoices: InvoiceWithRelations[], dateString: string): string {
  const tenant = invoices[0]?.Lease?.tenant;
  const property = invoices[0]?.Lease?.property;
  const unit = invoices[0]?.Lease?.unit;

  // Fixed: Added proper types for reduce functions
  const totalAmount = invoices.reduce((sum: number, inv) => sum + toNumber(inv.totalAmount), 0);
  const totalPaid = invoices.reduce((sum: number, inv) =>
    sum + inv.payments.reduce((pSum: number, p) => pSum + toNumber(p.amount), 0), 0
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

  invoices.forEach((invoice) => {
    content += `
${invoice.type} INVOICE:
  Amount: USD ${toNumber(invoice.totalAmount).toLocaleString()}
  Status: ${invoice.status || 'PENDING'}
  Items:${invoice.InvoiceItem.length > 0 ? '' : ' None'}
${invoice.InvoiceItem.map((item) => `    - ${item.description}: USD ${toNumber(item.amount).toLocaleString()}`).join('\n')}
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
