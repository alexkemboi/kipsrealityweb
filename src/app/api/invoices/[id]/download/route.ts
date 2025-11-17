// src/app/api/invoices/[id]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    let yPosition = height - 50;
    
    // Title
    page.drawText('INVOICE', {
      x: 50,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 40;
    
    // Invoice details
    page.drawText(`Invoice ID: ${invoice.id}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    yPosition -= 20;
    page.drawText(`Date Issued: ${invoice.createdAt?.toDateString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    yPosition -= 20;
    page.drawText(`Due Date: ${invoice.dueDate.toDateString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    yPosition -= 40;
    
    // Tenant Information
    page.drawText('Tenant Information:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    });
    
    yPosition -= 20;
    page.drawText(
      `${invoice.Lease.tenant?.firstName || ''} ${invoice.Lease.tenant?.lastName || ''}`,
      {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
      }
    );
    
    yPosition -= 20;
    page.drawText(invoice.Lease.tenant?.email || '', {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    yPosition -= 40;
    
    // Property Details
    page.drawText('Property Details:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    });
    
    yPosition -= 20;
    page.drawText(invoice.Lease.property?.name || '', {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    yPosition -= 20;
    page.drawText(invoice.Lease.property?.address || '', {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    yPosition -= 20;
    page.drawText(`Unit: ${invoice.Lease.unit?.unitNumber || ''}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    yPosition -= 40;
    
    // Invoice Items
    page.drawText('Invoice Items:', {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
    });
    
    yPosition -= 30;
    invoice.InvoiceItem.forEach((item) => {
      page.drawText(`${item.description}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
      });
      
      page.drawText(`KES ${item.amount}`, {
        x: 400,
        y: yPosition,
        size: 12,
        font: font,
      });
      
      yPosition -= 20;
    });
    
    yPosition -= 20;
    
    // Total Amount
    page.drawText(`Total Amount: KES ${Number(invoice.amount).toLocaleString()}`, {
      x: 350,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    // Convert Uint8Array to Buffer for NextResponse
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
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