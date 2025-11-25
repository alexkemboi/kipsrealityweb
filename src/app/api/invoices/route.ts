// src/app/api/invoices/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/Getcurrentuser";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const rawStatus = url.searchParams.get("status"); // "PENDING,OVERDUE"
    const type = url.searchParams.get("type");

    console.log("Filters received:", { rawStatus, type });

    // Build the where clause with user-based filtering
    const where: any = {
      // Only show invoices for properties managed by the current user
      Lease: {
        property: {
          manager: {
            userId: user.id,
          },
        },
      },
    };

    // ✅ FIX: Support multiple statuses
    if (rawStatus) {
      const statuses = rawStatus.split(",").map(s => s.trim());
      where.status = { in: statuses };
    }

    if (type) {
      where.type = type;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        payment: true, // ✅ ADD THIS - Include payment data for balance calculation
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
                apartmentComplexDetail: {
                  select: { buildingName: true }
                },
                houseDetail: {
                  select: { houseName: true }
                }
              },
            },
            unit: {
              select: { id: true, unitNumber: true, unitName: true }, // Added unitName
            }
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Fetched invoices:", JSON.stringify(invoices, null, 2));

    // Add financial calculations and building name
    const invoicesWithFinancials = invoices.map((invoice) => {
      const totalPaid = invoice.payment?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      const balance = invoice.amount - totalPaid;
      
      // Get building name from property details
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
          isOverdue: balance > 0 && new Date() > invoice.dueDate
        }
      };
    });

 const grouped = Object.values(
  invoicesWithFinancials.reduce((acc: any, inv) => {
    const dateKey = inv.dueDate.toISOString().split("T")[0];
    const leaseKey = inv.Lease?.id || "unknown";
    const groupKey = `${leaseKey}-${dateKey}`;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        leaseId: leaseKey,
        dueDate: inv.dueDate,
        totalAmount: 0,
        invoices: [],
      };
    }

    acc[groupKey].totalAmount += inv.amount;
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