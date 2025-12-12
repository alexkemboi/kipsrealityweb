import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from "@/lib/mail-service";

const DEFAULT_ROLE = 'PROPERTY_MANAGER';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, organizationName } = await request.json();

    // 1. Validate Input
    if (!email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'Email, password, and organization name are required' },
        { status: 400 }
      );
    }

    // 2. Pre-check Organization (Optimization to avoid starting transaction if not needed)
    const existingOrg = await prisma.organization.findFirst({
      where: { name: organizationName },
    });

    if (existingOrg) {
      return NextResponse.json({ error: "ORGANIZATION_EXISTS" }, { status: 409 });
    }

    // 3. Pre-check User
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'USER_EXISTS' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. ATOMIC TRANSACTION (Critical for Data Integrity)
    // If any step inside fails, the entire database rolls back.
    const result = await prisma.$transaction(async (tx) => {
      // A. Create Organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''), // Cleaner slug
          isActive: true,
        },
      });

      // B. Create User
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: hashedPassword, // Ensure your Schema uses 'passwordHash', not 'password'
          firstName,
          lastName,
          emailVerified: null,
          verificationToken: verificationToken,
        },
      });

      // C. Link User to Organization
      await tx.organizationUser.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: DEFAULT_ROLE,
        },
      });

      return user; // Return user to outside scope
    });

    // 5. Send Email (Only if transaction succeeded)
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({
      success: true,
      message: "Account created. Please check your email to verify your account.",
      user: {
        id: result.id,
        email: result.email,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
