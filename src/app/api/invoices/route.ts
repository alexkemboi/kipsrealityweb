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

    const filters: any = {};

    // ✅ FIX: Support multiple statuses
    if (rawStatus) {
      const statuses = rawStatus.split(",").map(s => s.trim());
      filters.status = { in: statuses };
    }

    if (type) filters.type = type;

    const invoices = await prisma.invoice.findMany({
      where: filters,
      include: {
        payment: true, // ✅ ADD THIS - Include payment data for balance calculation
        Lease: {
          include: {
            tenant: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            property: {
              select: { id: true, name: true, address: true, city: true },
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

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}