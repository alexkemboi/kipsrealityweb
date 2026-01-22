import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { financeActions } from "@/lib/finance/actions";

export async function GET(req: Request) {
  try {
    // 1. Security Check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("⏰ Starting Rent Roll...");

    // 2. Define Billing Window (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 3. Find Active Leases
    const activeLeases = await prisma.lease.findMany({
      where: { leaseStatus: "ACTIVE" },
      include: { property: true }
    });

    let createdCount = 0;
    const errors: string[] = [];

    // 4. Iterate and Generate
    for (const lease of activeLeases) {
      // A. Check duplicates for this month
      const existing = await prisma.invoice.findFirst({
        where: {
          leaseId: lease.id,
          type: "RENT",
          dueDate: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      if (existing) continue; // Already billed

      try {
        // B. Calculate Due Date (e.g. 5th of this month)
        const dueDay = lease.paymentDueDay || 5;
        const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);

        // C. Create Invoice
        const invoice = await prisma.invoice.create({
          data: {
            leaseId: lease.id,
            type: "RENT",
            totalAmount: lease.rentAmount,
            amountPaid: 0,
            balance: lease.rentAmount,
            dueDate: dueDate,
            status: "PENDING",
            postingStatus: "PENDING"
          }
        });

        // D. Post to GL
        await financeActions.postInvoiceToGL(invoice.id);
        createdCount++;
        
      } catch (e: any) {
        console.error(`❌ Failed invoice for Lease ${lease.id}:`, e);
        errors.push(lease.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      generated: createdCount,
      failed: errors.length,
      errors 
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Rent Roll Failed: " + error.message }, { status: 500 });
  }
}
