// app/api/lease/[id]/sign/[role]/route.ts
// ⚠️ IMPORTANT: This file MUST be at app/api/lease/[id]/sign/[role]/route.ts
// The folder name MUST be [role] not "tenant" or "landlord"

import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; role: string }> }
) {
  try {
    // Await and destructure params
    const params = await context.params;
    const leaseId = params.id;
    const role = params.role;
    
    console.log("📝 Route params extracted:", { leaseId, role });
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("📦 Request body:", body);
    } catch (e) {
      console.error("Failed to parse body:", e);
      body = {};
    }

    // Fetch lease upfront
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { tenant: true, property: true, unit: true },
    });

    if (!lease) {
      console.error("❌ Lease not found:", leaseId);
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    console.log("✅ Lease found:", {
      id: lease.id,
      tenantSigned: !!lease.tenantSignedAt,
      landlordSigned: !!lease.landlordSignedAt,
      leaseStatus: lease.leaseStatus
    });

    // === TENANT SIGNING (may be unauthenticated) ===
    if (role === "tenant") {
      const { token } = body;
      
      if (!token) {
        console.error("❌ Missing token in request body");
        return NextResponse.json(
          { error: "Missing invite token for tenant signing" }, 
          { status: 400 }
        );
      }

      console.log("🔍 Validating invite token...");

      // Validate invite token
      const invite = await prisma.invite.findUnique({ 
        where: { token },
        include: { lease: true }
      });

      if (!invite) {
        console.error("❌ Invite token not found:", token);
        return NextResponse.json(
          { error: "Invalid invite token" }, 
          { status: 403 }
        );
      }

      console.log("📋 Invite found:", {
        inviteId: invite.id,
        inviteLeaseId: invite.leaseId,
        requestedLeaseId: leaseId,
        matches: invite.leaseId === leaseId
      });

      if (invite.leaseId !== leaseId) {
        console.error("❌ Invite lease mismatch:", {
          inviteLeaseId: invite.leaseId,
          requestedLeaseId: leaseId
        });
        return NextResponse.json(
          { error: "Invite token does not match this lease" }, 
          { status: 403 }
        );
      }

      // Check if already signed
      if (lease.tenantSignedAt) {
        console.log("ℹ️ Tenant has already signed");
        return NextResponse.json({ 
          message: "Tenant has already signed", 
          lease 
        });
      }

      // Sign the lease
      console.log("✍️ Signing lease as tenant...");
      const updated = await prisma.lease.update({
        where: { id: leaseId },
        data: {
          tenantSignedAt: new Date(),
          leaseStatus: lease.landlordSignedAt ? "SIGNED" : "DRAFT",
        },
        include: { tenant: true, property: true, unit: true },
      });

      console.log("✅ Tenant signed lease successfully. New status:", updated.leaseStatus);

      return NextResponse.json({ 
        message: "Lease signed by tenant", 
        lease: updated 
      });
    }

    // === LANDLORD SIGNING (requires authentication) ===
    if (role === "landlord") {
      console.log("🏠 Landlord signing - checking authentication...");
      
      let user;
      
      try {
        user = await getCurrentUser(req);
      } catch (error) {
        console.error("❌ Authentication failed:", error);
        return NextResponse.json(
          { error: "Authentication required for landlord signing" }, 
          { status: 401 }
        );
      }

      if (!user) {
        console.error("❌ No user found after authentication");
        return NextResponse.json(
          { error: "Unauthorized - no user found" }, 
          { status: 401 }
        );
      }

      console.log("👤 User authenticated:", {
        userId: user.id,
        orgUserId: user.organizationUserId,
        propertyManagerId: lease.property?.managerId
      });

      // Verify landlord owns this property
      if (lease.property?.managerId !== user.organizationUserId) {
        console.error("❌ User not authorized for this property");
        return NextResponse.json(
          { error: "You are not authorized to sign this lease" }, 
          { status: 403 }
        );
      }

      // Check if already signed
      if (lease.landlordSignedAt) {
        console.log("ℹ️ Landlord has already signed");
        return NextResponse.json({ 
          message: "Landlord has already signed", 
          lease 
        });
      }

      // Sign the lease
      console.log("✍️ Signing lease as landlord...");
      const updated = await prisma.lease.update({
        where: { id: leaseId },
        data: {
          landlordSignedAt: new Date(),
          leaseStatus: lease.tenantSignedAt ? "SIGNED" : "DRAFT",
        },
        include: { tenant: true, property: true, unit: true },
      });

      console.log("✅ Landlord signed lease successfully. New status:", updated.leaseStatus);

      return NextResponse.json({ 
        message: "Lease signed by landlord", 
        lease: updated 
      });
    }

    console.error("❌ Invalid role provided:", role);
    return NextResponse.json(
      { error: `Invalid role: '${role}'. Must be 'tenant' or 'landlord'` }, 
      { status: 400 }
    );

  } catch (error) {
    console.error("💥 Sign lease error:", error);
    return NextResponse.json(
      { 
        error: "Failed to sign lease", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}