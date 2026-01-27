//lib/lease.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./db";
import { getCurrentUser } from "./Getcurrentuser";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leases = await prisma.lease.findMany({
      where: {
        property: {
          manager: {
            userId: user.id
          }
        }
      },
      include: {
        tenant: true,
        property: true,
        unit: true,
        application: true,
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    return NextResponse.json(leases);
  } catch (error) {
    console.error("Error fetching leases:", error);
    return NextResponse.json({ error: "Failed to fetch leases" }, { status: 500 });
  }
}