// app/api/lease/[id]/sign/[role]/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string; role: string }> }
) {
  try {
    const { id: leaseId, role } = await context.params;
    const body = await req.json();

    // Fetch lease upfront
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { tenant: true, property: true, unit: true },
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    // Tenant signing via invite token
    if (role === "tenant") {
      const { token } = body;
      if (!token) {
        return NextResponse.json({ error: "Missing invite token" }, { status: 400 });
      }

      const invite = await prisma.invite.findUnique({ where: { token } });
      if (!invite || invite.leaseId !== leaseId) {
        return NextResponse.json({ error: "Invalid invite or lease" }, { status: 403 });
      }

      if (lease.tenantSignedAt) {
        return NextResponse.json({ message: "Tenant has already signed", lease });
      }

      const updated = await prisma.lease.update({
        where: { id: leaseId },
        data: {
          tenantSignedAt: new Date(),
          leaseStatus: lease.landlordSignedAt ? "SIGNED" : "DRAFT",
        },
        include: { tenant: true, property: true, unit: true },
      });

      return NextResponse.json({ message: "Lease signed by tenant", lease: updated });
    }

    // Landlord signing (requires authentication)
    if (role === "landlord") {
      const user = await getCurrentUser(req);
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      if (lease.landlordSignedAt) {
        return NextResponse.json({ message: "Landlord has already signed", lease });
      }

      const updated = await prisma.lease.update({
        where: { id: leaseId },
        data: {
          landlordSignedAt: new Date(),
          leaseStatus: lease.tenantSignedAt ? "SIGNED" : "DRAFT",
        },
        include: { tenant: true, property: true, unit: true },
      });

      return NextResponse.json({ message: "Lease signed by landlord", lease: updated });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error) {
    console.error("Sign lease error:", error);
    return NextResponse.json({ error: "Failed to sign lease" }, { status: 500 });
  }
}
