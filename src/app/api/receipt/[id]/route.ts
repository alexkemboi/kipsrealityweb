// /app/api/receipt/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const byPayment = searchParams.get("byPayment") === "true";

    console.log("Fetching receipt:", { id, byPayment });

    let receipt;

    if (byPayment) {
      // Search by payment_id
      receipt = await prisma.receipt.findFirst({
        where: { payment_id: id },
        include: {
          payment: {
            include: {
              invoice: {
                include: {
                  Lease: {
                    include: {
                      property: true,
                      unit: true,
                      tenant: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } else {
      // Search by receipt id (default)
      receipt = await prisma.receipt.findUnique({
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
                      tenant: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!receipt) {
      console.log("Receipt not found for:", { id, byPayment });
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    console.log("Receipt found:", receipt.id);
    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}