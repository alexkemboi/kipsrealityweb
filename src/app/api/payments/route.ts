// /app/api/payments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.role !== "PROPERTY_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the organisation_user record for this user
    const orgUser = await prisma.organizationUser.findFirst({
      where: { userId: user.id },
    });

    if (!orgUser) {
      return NextResponse.json({ error: "User not linked to organization" }, { status: 404 });
    }

    console.log("Organisation User ID:", orgUser.id);

    const url = new URL(req.url);
    const propertyId = url.searchParams.get("propertyId");
    const unitId = url.searchParams.get("unitId");

    // Use orgUser.id to match against property.managerId
    const payments = await prisma.payment.findMany({
      where: {
        invoice: {
          Lease: {
            property: { managerId: orgUser.id }, // Use organisation_user.id here
            ...(propertyId ? { propertyId } : {}),
            ...(unitId ? { unitId } : {}),
          },
        },
      },
      include: {
        invoice: {
          include: {
            Lease: {
              include: {
                property: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { paidOn: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ 
      error: "Failed to fetch payments", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}