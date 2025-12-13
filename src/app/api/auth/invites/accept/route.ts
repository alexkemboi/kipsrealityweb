// app/api/auth/invites/accept/route.ts 
// (Note: This logic looks like a generic 'accept' route, not just for tenants)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, password, firstName, lastName, phone, companyName, serviceType } = body;

    if (!email || !token || !password || !firstName) {
      return NextResponse.json(
        { error: "Email, token, password, and first name are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // 1️⃣ Find invite by token (Read operation can be outside transaction)
    const invite = await prisma.invite.findUnique({
      where: { token }
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 });
    }

    // 2️⃣ Validate invite
    if (invite.email !== normalizedEmail) {
      return NextResponse.json({ error: "Invite email does not match" }, { status: 400 });
    }

    if (invite.accepted) {
      return NextResponse.json({ error: "Invite already used" }, { status: 400 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 3️⃣ ATOMIC TRANSACTION START
    // We use a transaction to ensure User, OrgLink, and Lease updates happen together.
    // If one fails, they all fail.
    const user = await prisma.$transaction(async (tx) => {
      let userRecord;

      const existingUser = await tx.user.findUnique({
        where: { email: normalizedEmail }
      });

      // A. Create or Update User
      if (existingUser) {
        // Reactivate/update inactive user
        userRecord = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash: hashedPassword,
            firstName,
            lastName,
            phone,
            status: "ACTIVE",
            // FIX: Set to current timestamp, not boolean
            emailVerified: new Date()
          }
        });
      } else {
        // Create new user
        userRecord = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            phone,
            status: "ACTIVE",
            // FIX: Set to current timestamp, not boolean
            emailVerified: new Date()
          }
        });
      }

      // B. Link user to organization
      const orgUser = await tx.organizationUser.findFirst({
        where: {
          userId: userRecord.id,
          organizationId: invite.organizationId
        }
      });

      if (!orgUser) {
        await tx.organizationUser.create({
          data: {
            userId: userRecord.id,
            organizationId: invite.organizationId,
            role: invite.role
          }
        });
      }

      // C. Mark invite as accepted
      await tx.invite.update({
        where: { id: invite.id },
        data: { accepted: true }
      });

      // D. Update lease to link tenant (if tenant invite)
      if (invite.leaseId) {
        await tx.lease.update({
          where: { id: invite.leaseId },
          data: { tenantId: userRecord.id }
        });
      }

      // E. Create Vendor record (if vendor invite)
      if (invite.role === "VENDOR" && companyName && serviceType) {
        await tx.vendor.create({
          data: {
            userId: userRecord.id,
            organizationId: invite.organizationId,
            companyName,
            serviceType,
            phone: phone || null,
            email: normalizedEmail,
            isActive: true
          }
        });
      }

      return userRecord;
    });
    // TRANSACTION END

    return NextResponse.json({
      success: true,
      message: invite.role === "VENDOR"
        ? "Vendor account created successfully. You may now log in."
        : "Invite accepted. Tenant account created and linked to lease.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}