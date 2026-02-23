import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mail-service';

// UserRole type - matches OrganizationUser.role accepted values
type UserRole = 'SYSTEM_ADMIN' | 'PROPERTY_MANAGER' | 'VENDOR' | 'TENANT' | 'AGENT';

// Define the roles we allow for registration (subset of UserRole)
const ALLOWED_ROLES: UserRole[] = ['SYSTEM_ADMIN', 'PROPERTY_MANAGER', 'VENDOR', 'TENANT'];

function createOrgSlug(name: string) {
  const slugBase = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return slugBase || `org-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Destructure specifically to handle logic
    const { email, password, firstName, lastName, organizationName, role } = body ?? {};

    // 1. Validate Basic Fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize inputs
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedFirstName = String(firstName).trim();
    const normalizedLastName = String(lastName).trim();
    const normalizedOrgName = organizationName ? String(organizationName).trim() : '';

    // Basic sanity checks
    if (!normalizedEmail || !normalizedFirstName || !normalizedLastName) {
      return NextResponse.json({ error: 'Invalid input values' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    if (!ALLOWED_ROLES.includes(role as UserRole)) {
      return NextResponse.json({ error: 'Invalid role selected' }, { status: 400 });
    }

    // 2. Validate Role-Specific Requirements
    // Property Managers and other anchored roles require an Organization Name.
    // Tenant is allowed to be a "floating" user without org linkage.
    if (role !== 'TENANT' && !normalizedOrgName) {
      return NextResponse.json(
        { error: 'Organization name is required for this role' },
        { status: 400 }
      );
    }

    // 3. Check for Existing User
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // 4. Prepare credentials + email verification token (store HASH only)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Raw token (emailed to user)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hashed token (stored in DB)
    const verificationTokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 5. ATOMIC TRANSACTION with timeout config
    const result = await prisma.$transaction(
      async (tx) => {
        // A. Create the User (Common for everyone)
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash: hashedPassword,
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            emailVerified: null,
            verificationTokenHash,
            verificationTokenExpiresAt,
          },
        });

        // B. Branch Logic: Anchored vs. Floating Users
        if (role === 'TENANT') {
          // --- FLOATING PATH (Tenant) ---
          // User exists but has no OrganizationUser row yet.
          // They can be linked later via Invite or Lease Application.
          return user;
        }

        // --- ANCHORED PATH (SYSTEM_ADMIN / PROPERTY_MANAGER / VENDOR) ---
        // Check duplicate org name (exact match; can be made case-insensitive in DB if needed)
        const existingOrg = await tx.organization.findFirst({
          where: { name: normalizedOrgName },
        });
        if (existingOrg) throw new Error('ORGANIZATION_EXISTS');

        // Ensure slug uniqueness
        let slug = createOrgSlug(normalizedOrgName);
        let slugExists = await tx.organization.findUnique({ where: { slug } });

        if (slugExists) {
          slug = `${slug}-${Date.now()}`;
          slugExists = await tx.organization.findUnique({ where: { slug } });
          if (slugExists) {
            // Very unlikely fallback
            slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
          }
        }

        const organization = await tx.organization.create({
          data: {
            name: normalizedOrgName,
            slug,
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

        return user;
      },
      {
        maxWait: 5000, // Wait max 5s to start the transaction
        timeout: 20000, // Allow 20s for the transaction to complete
      }
    );

    // 6. Send Verification Email (send raw token; DB stores hash only)
    await sendVerificationEmail(result.email, verificationToken);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created. Please check your email.',
        userId: result.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);

    if (error instanceof Error && error.message === 'ORGANIZATION_EXISTS') {
      return NextResponse.json({ error: 'Organization name already taken' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
