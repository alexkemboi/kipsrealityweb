import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
    try {
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

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        // 🚀 PARALLEL DATA FETCHING (The Ferrari Engine)
        const [
            totalUnits,
            occupiedUnits,
            vacantUnitsRent,
            revenueThisMonth,
            expensesThisMonth,
            overdueInvoices,
            activeMaintenance,
            expiringLeases,
            totalProperties,
            historicalPayments,
            historicalExpenses
        ] = await Promise.all([
            // 1. Total Units
            prisma.unit.count({ where: { property: { organizationId: orgId } } }),

            // 2. Occupied Units
            prisma.unit.count({ where: { property: { organizationId: orgId }, isOccupied: true } }),

            // 3. Vacancy Loss (Sum of potential rent from empty units)
            prisma.unit.aggregate({
                _sum: { rentAmount: true },
                where: { property: { organizationId: orgId }, isOccupied: false }
            }),

            // 4. Revenue (MTD)
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    invoice: { Lease: { property: { organizationId: orgId } } },
                    paidOn: { gte: firstDayOfMonth }
                }
            }),

            // 5. Operational Expenses (Maintenance Costs MTD)
            prisma.maintenanceRequest.aggregate({
                _sum: { cost: true },
                where: {
                    organizationId: orgId,
                    updatedAt: { gte: firstDayOfMonth },
                    status: "COMPLETED"
                }
            }),

            // 6. Arrears (Total Overdue)
            prisma.invoice.aggregate({
                _sum: { totalAmount: true },
                where: {
                    Lease: { property: { organizationId: orgId } },
                    status: "OVERDUE"
                }
            }),

            // 7. Active Maintenance Count
            prisma.maintenanceRequest.count({
                where: {
                    organizationId: orgId,
                    status: { in: ["OPEN", "IN_PROGRESS"] }
                }
            }),

            // 8. Leases Expiring Soon
            prisma.lease.count({
                where: {
                    property: { organizationId: orgId },
                    endDate: { gte: now, lte: thirtyDaysFromNow },
                    leaseStatus: "ACTIVE"
                }
            }),

            // Total Properties
            prisma.property.count({ where: { organizationId: orgId } }),

            // Historical Data for Chart (Revenue)
            prisma.payment.findMany({
                where: {
                    invoice: { Lease: { property: { organizationId: orgId } } },
                    paidOn: { gte: sixMonthsAgo }
                },
                select: { amount: true, paidOn: true }
            }),

            // Historical Data for Chart (Expenses)
            prisma.maintenanceRequest.findMany({
                where: {
                    organizationId: orgId,
                    status: "COMPLETED",
                    updatedAt: { gte: sixMonthsAgo }
                },
                select: { cost: true, updatedAt: true }
            })
        ]);

        // --- CALCULATIONS ---
        const totalRevenue = Number(revenueThisMonth._sum.amount || 0);
        const totalExpenses = Number(expensesThisMonth._sum.cost || 0);
        const netOperatingIncome = totalRevenue - totalExpenses;
        const vacancyLoss = Number(vacantUnitsRent._sum.rentAmount || 0);
        const arrears = Number(overdueInvoices._sum.totalAmount || 0);
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

        // Group Historical Data into 6 Months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chartData = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[d.getMonth()];

            const monthlyRevenue = historicalPayments
                .filter(p => p.paidOn && new Date(p.paidOn).getMonth() === d.getMonth() && new Date(p.paidOn).getFullYear() === d.getFullYear())
                .reduce((sum, p) => sum + Number(p.amount), 0);

            const monthlyExpenses = historicalExpenses
                .filter(e => e.updatedAt && new Date(e.updatedAt).getMonth() === d.getMonth() && new Date(e.updatedAt).getFullYear() === d.getFullYear())
                .reduce((sum, e) => sum + Number(e.cost || 0), 0);

            chartData.push({
                month: monthName,
                revenue: monthlyRevenue,
                expenses: monthlyExpenses
            });
        }

        return NextResponse.json({
            success: true,
            totalProperties,
            kpis: {
                revenue: totalRevenue,
                noi: netOperatingIncome,
                arrears: arrears,
                occupancyRate: occupancyRate,
                vacancyLoss: vacancyLoss,
                activeMaintenance: activeMaintenance,
                expiringLeases: expiringLeases,
                totalUnits: totalUnits,
                currency: "USD"
            },
            chartData: chartData
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
