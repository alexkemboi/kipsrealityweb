// src/app/api/auth/invites/agent/accept-invite/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { token, fullName, email, password } = await request.json();

    // Validate input
    if (!token || !fullName || !email || !password) {
      console.error("Missing fields:", { token: !!token, fullName: !!fullName, email: !!email, password: !!password });
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Hash the token to find the invite
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log("Looking for invite with tokenHash:", tokenHash);

    // Find and validate the invite - get organization from tenant's membership
    const invite = await prisma.agentInvite.findUnique({
      where: {
        inviteTokenHash: tokenHash,
      },
      include: {
        tenant: {
          include: {
            organizationUsers: {
              where: {
                role: "TENANT"
              },
              include: {
                organization: true
              }
            },
          },
        },
      },
    });

    if (!invite) {
      console.error("Invite not found");
      return NextResponse.json(
        { error: "Invalid invite token" },
        { status: 404 }
      );
    }

    console.log("Invite found:", { id: invite.id, isUsed: invite.isUsed, expiresAt: invite.expiresAt });

    if (invite.isUsed) {
      console.error("Invite already used");
      return NextResponse.json(
        { error: "Invite has already been used" },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      console.error("Invite expired");
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 400 }
      );
    }

    // Get the organization from tenant's membership
    const tenantOrgMembership = invite.tenant.organizationUsers[0];
    
    console.log("Tenant organization memberships:", {
      count: invite.tenant.organizationUsers.length,
      hasOrganization: !!tenantOrgMembership?.organization
    });

    if (!tenantOrgMembership?.organization) {
      console.error("No organization found for tenant");
      return NextResponse.json(
        { error: "Unable to determine organization. Tenant is not associated with any organization." },
        { status: 400 }
      );
    }

    const organization = tenantOrgMembership.organization;
    console.log("Organization:", { id: organization.id, name: organization.name });

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.error("Email already registered");
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Split full name
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || undefined;

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    console.log("Creating user...");

    // Create the new agent user in a transaction
    const newUser = await prisma.$transaction(
      async (tx) => {
        // 1. Create the User
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            status: "ACTIVE",
            emailVerified: null,
            verificationToken,
          },
        });

        console.log("User created:", user.id);

        // 2. Link Agent to Tenant's Organization (FIXED)
        const orgUser = await tx.organizationUser.create({
          data: {
            userId: user.id,
            organizationId: organization.id, 
            role: "AGENT",
          },
        });

        console.log("Created OrganizationUser:", orgUser);

        // 3. Mark invite as used
        await tx.agentInvite.update({
          where: {
            id: invite.id,
          },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });

        console.log("Marked invite as used");

        return user;
      },
      {
        maxWait: 5000,
        timeout: 20000,
      }
    );

    console.log("Transaction complete");

    return NextResponse.json({
      success: true,
      userId: newUser.id,
      message: "Agent account created successfully",
      organizationId: organization.id,
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}