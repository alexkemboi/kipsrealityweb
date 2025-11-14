// src/app/api/invoices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");

    console.log("Filters received:", { status, type });

    const filters: any = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const invoices = await prisma.invoice.findMany({
      where: filters,
      include: {
        Lease: {
          include: {
            tenant: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            property: {
              select: { id: true, name: true, address: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Fetched invoices:", JSON.stringify(invoices, null, 2));

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}


