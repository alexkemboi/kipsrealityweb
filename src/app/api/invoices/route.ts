// src/app/api/invoices/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { toNumber } from "@/lib/decimal-utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);

    // Filters
    const rawStatus = url.searchParams.get("status"); // supports "PENDING,OVERDUE"
    const type = url.searchParams.get("type"); // RENT | UTILITY | MAINTENANCE | DAMAGE
    const leaseId = url.searchParams.get("lease_id");
    const pastDue = url.searchParams.get("pastDue"); // "1" => dueDate < now

    const now = new Date();

    // Tenant-safe scope (property manager scope)
    const where: any = {
      Lease: {
        property: {
          manager: {
            userId: user.id,
          },
        },
      },
    };

    // Filter by statuses (supports comma-separated list)
    if (rawStatus) {
      const statuses = rawStatus
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (statuses.length > 0) {
        where.status = { in: statuses };
      }
    }

    // Filter by invoice type
    if (type) {
      where.type = type;
    }

    // Filter by lease id (used by group/[id] page)
    if (leaseId) {
      where.leaseId = leaseId;
    }

    // ✅ NEW: pastDue=1 means dueDate < now
    // Keep this independent of status so it catches "PENDING but late" too.
    if (pastDue === "1") {
      where.dueDate = { lt: now };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        payments: true,
        Lease: {
          include: {
            tenant: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            property: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                apartmentComplexDetail: { select: { buildingName: true } },
                houseDetail: { select: { houseName: true } },
              },
            },
            unit: {
              select: { id: true, unitNumber: true, unitName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000, // safety cap; add pagination later
    });

    // Add financial calculations + buildingName
    const invoicesWithFinancials = invoices.map((invoice) => {
      const totalPaid =
        invoice.payments?.reduce((sum, p) => sum + toNumber(p.amount), 0) || 0;

      const totalAmount = toNumber(invoice.totalAmount);
      const balance = totalAmount - totalPaid;

      const buildingName =
        invoice.Lease?.property?.apartmentComplexDetail?.buildingName ||
        invoice.Lease?.property?.houseDetail?.houseName ||
        invoice.Lease?.property?.name ||
        "N/A";

      return {
        ...invoice,
        buildingName,
        financialSummary: {
          totalPaid,
          balance,
          isPaid: balance <= 0,
          isOverdue: balance > 0 && now > invoice.dueDate,
        },
      };
    });

    // Group by (leaseId + dueDate)
    const grouped = Object.values(
      invoicesWithFinancials.reduce((acc: any, inv: any) => {
        const dateKey =
          inv.dueDate instanceof Date
            ? inv.dueDate.toISOString().split("T")[0]
            : new Date(inv.dueDate).toISOString().split("T")[0];

        const leaseKey = inv.Lease?.id || inv.leaseId || "unknown";
        const groupKey = `${leaseKey}-${dateKey}`;

        if (!acc[groupKey]) {
          acc[groupKey] = {
            leaseId: leaseKey,
            date: inv.dueDate, // keep your existing group page compatibility
            totalAmount: 0,
            invoices: [],
          };
        }

        acc[groupKey].totalAmount += toNumber(inv.totalAmount);
        acc[groupKey].invoices.push(inv);

        return acc;
      }, {})
    );

    return NextResponse.json(grouped);
  } catch (err) {
    console.error("GET /api/invoices error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
