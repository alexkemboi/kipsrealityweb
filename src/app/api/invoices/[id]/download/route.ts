// src/app/api/invoices/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch invoice with related data
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        Lease: {
          include: {
            tenant: true,
            property: true,
            unit: true,
          },
        },
        InvoiceItem: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Generate PDF as a buffer
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      // Use built-in font to avoid Helvetica.afm error
      doc.font("Times-Roman");

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ---------- PDF CONTENT ----------
      doc.fontSize(22).text("INVOICE", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Invoice ID: ${invoice.id}`);
      doc.text(`Date Issued: ${invoice.createdAt?.toDateString()}`);
      doc.text(`Due Date: ${invoice.dueDate.toDateString()}`);
      doc.moveDown();

      doc.fontSize(14).text("Tenant Information", { underline: true });
      doc.fontSize(12).text(
        `${invoice.Lease.tenant?.firstName || ""} ${invoice.Lease.tenant?.lastName || ""}`
      );
      doc.text(invoice.Lease.tenant?.email || "");
      doc.moveDown();

      doc.fontSize(14).text("Property Details", { underline: true });
      doc.fontSize(12).text(invoice.Lease.property?.name || "");
      doc.text(invoice.Lease.property?.address || "");
      doc.text(`Unit: ${invoice.Lease.unit?.unitNumber || ""}`);
      doc.moveDown();

      doc.fontSize(14).text("Invoice Items", { underline: true });
      doc.moveDown(0.5);
      invoice.InvoiceItem.forEach((item) => {
        doc.fontSize(12).text(`${item.description} - KES ${item.amount}`);
      });

      doc.moveDown();
      doc.fontSize(14).text(
        `Total Amount: KES ${Number(invoice.amount).toLocaleString()}`,
        { align: "right" }
      );

      doc.end();
    });

    // Return PDF as Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${invoice.id}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
