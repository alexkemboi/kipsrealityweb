import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(req: Request) {
    try {
        // 1. Auth Check (Mocked for dev, switch to verifyAccessToken in prod)
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        // if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);

        // Mock Org ID (From your Seed) - fallback preserved
        const orgId = searchParams.get("organizationId") || "46e17dc1-137b-4e7a-a254-797a8ce16b0d";

        // 2. Get Financial Entity
        const entity = await prisma.financialEntity.findFirst({
            where: { organizationId: orgId }
        });

        if (!entity) {
            return NextResponse.json({ success: true, data: { cashInBank: 0, outstandingArrears: 0, currency: "USD" } });
        }

        // 3. QUERY: CASH IN BANK (Account 1000)
        // Asset Account: Net Balance = Debits - Credits
        const cashResult = await prisma.journalLine.aggregate({
            where: {
                account: { code: "1000", entityId: entity.id }
            },
            _sum: { debit: true, credit: true }
        });

        const cashInBank = (cashResult._sum.debit || new Decimal(0))
            .minus(cashResult._sum.credit || new Decimal(0));

        // 4. QUERY: OUTSTANDING ARREARS (Account 1100)
        // Asset Account: Net Balance = Debits (Invoiced) - Credits (Paid)
        const arResult = await prisma.journalLine.aggregate({
            where: {
                account: { code: "1100", entityId: entity.id }
            },
            _sum: { debit: true, credit: true }
        });

        const outstandingArrears = (arResult._sum.debit || new Decimal(0))
            .minus(arResult._sum.credit || new Decimal(0));

        // 5. Return Data
        return NextResponse.json({
            success: true,
            data: {
                cashInBank: cashInBank.toNumber(),
                outstandingArrears: outstandingArrears.toNumber(),
                currency: "USD"
            }
        });

    } catch (error: any) {
        console.error("[Finance Summary Error]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
