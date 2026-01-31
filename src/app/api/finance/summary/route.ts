import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { Decimal } from "@prisma/client/runtime/library";
import { CHART_OF_ACCOUNTS } from "@/lib/finance/types";

export async function GET(req: Request) {
    try {
        // 1. Authentication
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let payload;
        try {
            payload = verifyAccessToken(token);
        } catch (authError) {
            console.error("Auth Token Verification Error:", authError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!payload?.organizationId) {
            return NextResponse.json({ error: "Organization required" }, { status: 403 });
        }

        const orgId = payload.organizationId;

        // 2. Get Financial Entity
        const entity = await prisma.financialEntity.findFirst({
            where: { organizationId: orgId }
        });

        if (!entity) {
            return NextResponse.json({
                cashInBank: 0,
                accountsReceivable: 0,
                accountsPayable: 0,
                rentalIncome: 0,
                utilityExpense: 0,
                netOperatingIncome: 0,
                currency: "USD"
            });
        }

        // 3. PARALLEL QUERIES for all account balances
        const [
            cashBalance,
            arBalance,
            apBalance,
            rentalIncomeBalance,
            utilityExpenseBalance
        ] = await Promise.all([
            // Cash (Asset - Debit Normal) - Account 1000
            prisma.journalLine.aggregate({
                where: { 
                    account: { 
                        code: CHART_OF_ACCOUNTS.CASH_IN_BANK, 
                        entityId: entity.id 
                    }
                },
                _sum: { debit: true, credit: true }
            }),
            
            // Accounts Receivable (Asset - Debit Normal) - Account 1100
            prisma.journalLine.aggregate({
                where: { 
                    account: { 
                        code: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE, 
                        entityId: entity.id 
                    }
                },
                _sum: { debit: true, credit: true }
            }),
            
            // Accounts Payable (Liability - Credit Normal) - Account 2200
            prisma.journalLine.aggregate({
                where: { 
                    account: { 
                        code: CHART_OF_ACCOUNTS.ACCOUNTS_PAYABLE, 
                        entityId: entity.id 
                    }
                },
                _sum: { debit: true, credit: true }
            }),
            
            // Rental Income (Revenue - Credit Normal) - Account 4000
            prisma.journalLine.aggregate({
                where: { 
                    account: { 
                        code: CHART_OF_ACCOUNTS.RENTAL_INCOME, 
                        entityId: entity.id 
                    }
                },
                _sum: { debit: true, credit: true }
            }),
            
            // Utility Expense (Expense - Debit Normal) - Account 5200
            prisma.journalLine.aggregate({
                where: { 
                    account: { 
                        code: CHART_OF_ACCOUNTS.UTILITY_EXPENSE, 
                        entityId: entity.id 
                    }
                },
                _sum: { debit: true, credit: true }
            })
        ]);

        // 4. Calculate balances based on account type normal balances
        // Assets/Expenses: Debit - Credit (Debit normal)
        // Liabilities/Revenue: Credit - Debit (Credit normal)
        const cash = Number(cashBalance._sum.debit || 0) - Number(cashBalance._sum.credit || 0);
        const ar = Number(arBalance._sum.debit || 0) - Number(arBalance._sum.credit || 0);
        const ap = Number(apBalance._sum.credit || 0) - Number(apBalance._sum.debit || 0);
        const rentalIncome = Number(rentalIncomeBalance._sum.credit || 0) - Number(rentalIncomeBalance._sum.debit || 0);
        const utilityExpense = Number(utilityExpenseBalance._sum.debit || 0) - Number(utilityExpenseBalance._sum.credit || 0);

        // 5. Calculate Net Operating Income
        const netOperatingIncome = rentalIncome - utilityExpense;

        // 6. Return Data in the format expected by FinancialSummaryCard
        return NextResponse.json({
            cashInBank: cash,
            accountsReceivable: ar,
            accountsPayable: ap,
            rentalIncome: rentalIncome,
            utilityExpense: utilityExpense,
            netOperatingIncome: netOperatingIncome,
            currency: 'USD'
        });

    } catch (error: unknown) {
        console.error("[Finance Summary Error]", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
