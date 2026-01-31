import { NextResponse } from "next/server";
import { setupFinancials } from "@/lib/finance/setup";
import { journalService } from "@/lib/finance/journal-service";
import { prisma } from "@/lib/db";
import { CHART_OF_ACCOUNTS } from "@/lib/finance/types";

export async function GET() {
    try {
        // 1. Mock an Org (Get the first one found)
        const org = await prisma.organization.findFirst();
        if (!org) return NextResponse.json({ error: "No Org found" });

        // 2. Run Setup (Idempotent check usually needed, but fine for test)
        // Only run if entity doesn't exist
        let entity = await prisma.financialEntity.findFirst({ where: { organizationId: org.id } });
        if (!entity) {
            console.log("Setting up financials for org:", org.name);
            entity = await setupFinancials(org.id, org.name);
        }

        // 3. Try Posting a BALANCED Entry (Should Success)
        console.log("Attempting valid post...");
        const successEntry = await journalService.post({
            organizationId: org.id,
            date: new Date(),
            description: "Test Rent Payment",
            reference: "TEST-001",
            lines: [
                { accountCode: CHART_OF_ACCOUNTS.CASH_IN_BANK, debit: 100, credit: 0 }, // Cash increases
                { accountCode: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE, debit: 0, credit: 100 }  // AR decreases
            ]
        });
        console.log("Valid post successful:", successEntry.id);

        // 4. Try Posting an UNBALANCED Entry (Should Fail)
        let capturedError = null;
        try {
            console.log("Attempting invalid post...");
            await journalService.post({
                organizationId: org.id,
                date: new Date(),
                description: "Fraud Attempt",
                lines: [
                    { accountCode: CHART_OF_ACCOUNTS.CASH_IN_BANK, debit: 100, credit: 0 },
                    { accountCode: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE, debit: 0, credit: 50 } // Mismatch!
                ]
            });
        } catch (e) {
            console.log("Validation correctly blocked bad entry:", e);
            capturedError = e;
        }

        return NextResponse.json({
            success: true,
            entryId: successEntry.id,
            setupOrgId: org.id,
            validationTestPassed: !!capturedError
        });
    } catch (error: any) {
        console.error("Test failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
