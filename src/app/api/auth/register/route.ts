import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from "@/lib/mail-service";

// UserRole type - matches OrganizationUser.role accepted values
type UserRole = 'SYSTEM_ADMIN' | 'PROPERTY_MANAGER' | 'VENDOR' | 'TENANT' | 'AGENT';

// Define the roles we allow for registration (subset of UserRole)
const ALLOWED_ROLES: UserRole[] = ['SYSTEM_ADMIN', 'PROPERTY_MANAGER', 'VENDOR', 'TENANT'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Destructure specifically to handle logic
    const { email, password, firstName, lastName, organizationName, role } = body;

    // 1. Validate Basic Fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate role
    if (!ALLOWED_ROLES.includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      );
    }

    // 2. Validate Role-Specific Requirements
    // Only Property Managers MUST provide an Organization Name
    if (role === 'PROPERTY_MANAGER' && !organizationName) {
      return NextResponse.json({ error: 'Organization name is required for Property Managers' }, { status: 400 });
    }

    // 3. Check for Existing User
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. ATOMIC TRANSACTION with timeout config
    const result = await prisma.$transaction(async (tx) => {
      // A. Create the User (Common for everyone)
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          firstName,
          lastName,
          emailVerified: null,
          verificationToken: verificationToken,
        },
      });

      // B. Branch Logic: Anchored vs. Floating Users
      if (role === 'PROPERTY_MANAGER') {
        // --- ANCHORED PATH (Property Manager) ---

        // Check duplicate org name
        const existingOrg = await tx.organization.findFirst({
          where: { name: organizationName }
        });
        if (existingOrg) throw new Error("ORGANIZATION_EXISTS");

        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            slug: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            isActive: true,
          },
        });

        // Link User to Org
        await tx.organizationUser.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: 'PROPERTY_MANAGER',
          },
        });

      } else if (role === 'TENANT') {
        // --- FLOATING PATH (Tenant) ---
        // Do NOTHING here. The user exists, but has no entries in OrganizationUser.
        // They will be linked later via Invite or Lease Application.
      }
      // Note: Other roles (VENDOR, AGENT, SYSTEM_ADMIN) could be handled here if needed
      // For now, they follow the same anchored pattern as PROPERTY_MANAGER
      else {
        // --- OTHER ANCHORED ROLES (VENDOR, AGENT, SYSTEM_ADMIN) ---
        if (!organizationName) {
          throw new Error('Organization name is required for this role');
        }

        const existingOrg = await tx.organization.findFirst({
          where: { name: organizationName }
        });
        if (existingOrg) throw new Error("ORGANIZATION_EXISTS");

        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            slug: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            isActive: true,
          },
        });

        await tx.organizationUser.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: role as UserRole,
          },
        });
      }

      return user;
    }, {
      maxWait: 5000, // Wait max 5s to start the transaction
      timeout: 20000 // ✅ Allow 20s for the transaction to complete (Fixes the crash)
    });

    // 5. Send Verification Email
    await sendVerificationEmail(result.email, verificationToken);

    return NextResponse.json({
      success: true,
      message: "Account created. Please check your email.",
      userId: result.id
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Registration error:', error);

    if (error instanceof Error && error.message === "ORGANIZATION_EXISTS") {
      return NextResponse.json({ error: "Organization name already taken" }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
