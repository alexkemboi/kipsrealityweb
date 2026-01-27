import { prisma } from "../src/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

async function main() {
    const orgId = "46e17dc1-137b-4e7a-a254-797a8ce16b0d";

    console.log("🔍 Verifying Financial Summary for Org:", orgId);

    const entity = await prisma.financialEntity.findFirst({
        where: { organizationId: orgId }
    });

    if (!entity) {
        console.error("❌ No Financial Entity found.");
        return;
    }

    // Revenue (4000)
    const incomeResult = await prisma.journalLine.aggregate({
        where: { account: { code: "4000", entityId: entity.id } },
        _sum: { credit: true, debit: true }
    });
    const totalIncome = (incomeResult._sum.credit || new Decimal(0)).minus(incomeResult._sum.debit || new Decimal(0));

    // AR (1100)
    const arResult = await prisma.journalLine.aggregate({
        where: { account: { code: "1100", entityId: entity.id } },
        _sum: { debit: true, credit: true }
    });
    const outstandingArrears = (arResult._sum.debit || new Decimal(0)).minus(arResult._sum.credit || new Decimal(0));

    // Cash (1000)
    const cashResult = await prisma.journalLine.aggregate({
        where: { account: { code: "1000", entityId: entity.id } },
        _sum: { debit: true, credit: true }
    });
    const cashCollected = (cashResult._sum.debit || new Decimal(0)).minus(cashResult._sum.credit || new Decimal(0));

    console.log("\n📊 Finance Summary Results:");
    console.log("---------------------------");
    console.log(`Cash (In Bank - 1000): ${cashCollected.toNumber()} USD`);
    console.log(`Arrears (Outstanding - 1100): ${outstandingArrears.toNumber()} USD`);
    console.log("---------------------------");

    if (cashCollected.toNumber() === 500 && outstandingArrears.toNumber() === 1500) {
        console.log("✅ SUCCESS: Data matches current ledger state (2000 Invoiced - 500 Paid).");
    } else {
        console.warn("⚠️ Data differs from expectation. Ensure test-gl.ts was run recently.");
    }
}

main();
