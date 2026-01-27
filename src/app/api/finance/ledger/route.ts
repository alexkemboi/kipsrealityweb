import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(req: Request) {
    try {
        // 1. Auth Check (Mocked for dev)
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const { searchParams } = new URL(req.url);

        // TODO: Dynamic Org ID extraction (fallback preserved)
        const orgId = searchParams.get("organizationId") || "46e17dc1-137b-4e7a-a254-797a8ce16b0d";

        // 2. Get Financial Entity
        const entity = await prisma.financialEntity.findFirst({
            where: { organizationId: orgId }
        });

        if (!entity) {
            return NextResponse.json({ success: true, data: [] });
        }

        // 3. Fetch Accounts
        const accounts = await prisma.account.findMany({
            where: { entityId: entity.id },
            orderBy: { code: 'asc' }
        });

        // 4. Calculate Balances using database aggregation for scalability
        const ledger = await Promise.all(accounts.map(async (account) => {
            const agg = await prisma.journalLine.aggregate({
                where: { accountId: account.id },
                _sum: {
                    debit: true,
                    credit: true
                }
            });

            const totalDebit = Number(agg._sum.debit || 0);
            const totalCredit = Number(agg._sum.credit || 0);

            let balance = 0;

            // ASSET & EXPENSE: Normal Balance is Debit
            if (account.type === 'ASSET' || account.type === 'EXPENSE') {
                balance = totalDebit - totalCredit;
            }
            // LIABILITY, EQUITY, INCOME: Normal Balance is Credit
            else {
                balance = totalCredit - totalDebit;
            }

            return {
                id: account.id,
                code: account.code,
                name: account.name,
                type: account.type,
                balance: balance,
                totalDebits: totalDebit,
                totalCredits: totalCredit
            };
        }));

        return NextResponse.json({
            success: true,
            data: ledger
        });

    } catch (error: any) {
        console.error("[Ledger API Error]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
