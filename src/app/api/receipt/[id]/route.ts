// /app/api/receipt/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            invoice: {
              include: {
                Lease: {
                  include: {
                    property: true,
                    unit: true,
                    tenant: true, // Just include the full tenant object
                  }
                }
              }
            }
          }
        },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json({ error: "Failed to fetch receipt" }, { status: 500 });
  }
}