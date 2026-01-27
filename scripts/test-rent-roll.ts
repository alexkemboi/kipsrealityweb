import { prisma } from "../src/lib/db";
import { financeActions } from "../src/lib/finance/actions";

async function main() {
    console.log("⏰ Starting Rent Roll Simulation...");

    // 1. Define Billing Window (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log(`Period: ${startOfMonth.toDateString()} to ${endOfMonth.toDateString()}`);

    // 2. Find Active Leases
    const activeLeases = await prisma.lease.findMany({
        where: { leaseStatus: "ACTIVE" },
        include: { property: true }
    });

    if (activeLeases.length === 0) {
        console.log("⚠️ No active leases found. Please ensure you have at least one active lease in the DB.");
        return;
    }

    console.log(`Found ${activeLeases.length} active leases.`);

    let createdCount = 0;
    const errors: string[] = [];

    // 3. Iterate and Generate (Logic copied from the Cron route)
    for (const lease of activeLeases) {
        // A. Check duplicates for this month
        const existing = await prisma.invoice.findFirst({
            where: {
                leaseId: lease.id,
                type: "RENT",
                dueDate: { gte: startOfMonth, lte: endOfMonth }
            }
        });

        if (existing) {
            console.log(`ℹ️ Lease ${lease.id.substring(0, 8)}: Already billed for this month.`);
            continue;
        }

        try {
            // B. Calculate Due Date (e.g. 5th of this month)
            const dueDay = lease.paymentDueDay || 5;
            const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);

            console.log(`📄 Creating invoice for Lease ${lease.id.substring(0, 8)}, Amount: ${lease.rentAmount}, Due: ${dueDate.toDateString()}`);

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
            console.log(`🚀 Posting Invoice ${invoice.id.substring(0, 8)} to GL...`);
            await financeActions.postInvoiceToGL(invoice.id);
            createdCount++;

        } catch (e: any) {
            console.error(`❌ Failed invoice for Lease ${lease.id}:`, e);
            errors.push(lease.id);
        }
    }

    console.log("\n📊 Rent Roll Summary:");
    console.log(`- Created: ${createdCount}`);
    console.log(`- Failed: ${errors.length}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
