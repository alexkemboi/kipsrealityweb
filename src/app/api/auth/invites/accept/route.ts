// app/api/auth/invites/tenant/route.ts
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

    // 1️⃣ Find invite by token
    let invite = await prisma.invite.findUnique({
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

    // 3️⃣ Create or update user
    const hashedPassword = await bcrypt.hash(password, 12);
    let user;

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      // Reactivate/update inactive user
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          status: "ACTIVE",
          emailVerified: true
        }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          status: "ACTIVE",
          emailVerified: true
        }
      });
    }

    // 4️⃣ Link user to organization (if not exists)
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId: user.id,
        organizationId: invite.organizationId
      }
    });

    if (!orgUser) {
      await prisma.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: invite.organizationId,
          role: invite.role
        }
      });
    }

    // 5️⃣ Mark invite as accepted
    await prisma.invite.update({
      where: { id: invite.id },
      data: { accepted: true }
    });

    // 6️⃣ Update lease to link tenant (if tenant invite)
    if (invite.leaseId) {
      await prisma.lease.update({
        where: { id: invite.leaseId },
        data: { tenantId: user.id }
      });
    }

    // 7️⃣ Create Vendor record (if vendor invite)
    if (invite.role === "VENDOR" && companyName && serviceType) {
      await prisma.vendor.create({
        data: {
          userId: user.id,
          organizationId: invite.organizationId,
          companyName,
          serviceType,
          phone: phone || null,
          email: normalizedEmail,
          isActive: true
        }
      });
    }

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
