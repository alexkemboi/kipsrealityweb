import { PrismaClient, AccountType } from "@prisma/client";

const prisma = new PrismaClient();

// Standard GAAP Chart of Accounts for Property Management - Updated to match CHART_OF_ACCOUNTS constants
const STANDARD_COA = [
    // ASSETS (1000-1999)
    { code: "1000", name: "Cash - Operating Account", type: AccountType.ASSET },
    { code: "1100", name: "Accounts Receivable", type: AccountType.ASSET },
    { code: "1200", name: "Security Deposit Bank Account", type: AccountType.ASSET },

    // LIABILITIES (2000-2999)
    { code: "2100", name: "Tenant Security Deposits Liability", type: AccountType.LIABILITY },
    { code: "2200", name: "Accounts Payable", type: AccountType.LIABILITY },
    { code: "2300", name: "Prepaid Rent (Unearned Income)", type: AccountType.LIABILITY },

    // EQUITY (3000-3999)
    { code: "3000", name: "Owner's Capital", type: AccountType.EQUITY },

    // INCOME (4000-4999)
    { code: "4000", name: "Rental Income", type: AccountType.INCOME },
    { code: "4100", name: "Utility Reimbursement", type: AccountType.INCOME },
    { code: "4200", name: "Late Fee Income", type: AccountType.INCOME },
    { code: "4300", name: "Maintenance Reimbursement", type: AccountType.INCOME },

    // EXPENSES (5000-5999)
    { code: "5100", name: "Maintenance Expense", type: AccountType.EXPENSE },
    { code: "5200", name: "Utilities Expense", type: AccountType.EXPENSE },
    { code: "5300", name: "Property Management Fees", type: AccountType.EXPENSE },
];

async function main() {
    console.log("🏦 Seeding Chart of Accounts...");

    // 1. Get all Organizations
    const orgs = await prisma.organization.findMany({
        include: { financialEntities: true }
    });

    for (const org of orgs) {
        console.log(`Processing Org: ${org.name}...`);

        // 2. Ensure Org has a Financial Entity (The Legal Entity)
        let entityId = org.financialEntities[0]?.id;

        if (!entityId) {
            const newEntity = await prisma.financialEntity.create({
                data: {
                    name: org.name, // Default to Org Name
                    organizationId: org.id
                }
            });
            entityId = newEntity.id;
            console.log(`   -> Created Financial Entity: ${newEntity.name}`);
        }

        // 3. Create Accounts for this Entity
        for (const acc of STANDARD_COA) {
            // Upsert: Create if not exists, update name if exists
            await prisma.account.upsert({
                where: {
                    entityId_code: {
                        entityId,
                        code: acc.code
                    }
                },
                update: {}, // Do nothing if exists
                create: {
                    entityId,
                    code: acc.code,
                    name: acc.name,
                    type: acc.type,
                    isSystem: true // Lock these standard accounts
                }
            });
        }
        console.log(`   -> ✅ Standard Accounts Synced.`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
