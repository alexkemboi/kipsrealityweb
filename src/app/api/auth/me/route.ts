import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

const UpdatePreferencesSchema = z
  .object({
    consentNotifications: z.boolean().optional(),
    consentMarketing: z.boolean().optional(),
  })
  .strict();

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim() || null;
}

// Support cookie-based auth first (your current login sets httpOnly cookies)
// and Bearer token fallback for mobile/API clients.
async function getAccessTokenFromRequest(request: Request): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('token')?.value ?? null;
  return cookieToken ?? getBearerToken(request);
}

function selectPrimaryOrgUser(
  organizationUsers: Array<{
    id: string;
    role: string;
    organizationId: string;
    organization: { id: string; name: string; slug: string };
  }>
) {
  if (!organizationUsers?.length) return null;

  // Prefer non-tenant roles when available
  const privileged = organizationUsers.find((ou) => ou.role !== 'TENANT');
  return privileged ?? organizationUsers[0];
}

function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function GET(request: Request) {
  try {
    const token = await getAccessTokenFromRequest(request);

    if (!token) {
      return unauthorized('No access token provided');
    }

    let payload: {
      userId: string;
      email?: string;
      role?: string;
      type?: 'access';
      organizationId?: string;
      organizationUserId?: string;
    };

    try {
      payload = verifyAccessToken(token);
    } catch {
      return unauthorized('Invalid or expired token');
    }

    if (payload.type && payload.type !== 'access') {
      return unauthorized('Invalid token type');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        organizationUsers: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return unauthorized('Session is no longer valid');
    }

    if (user.status !== 'ACTIVE') {
      return forbidden('Account is not active');
    }

    const primaryOrgUser = selectPrimaryOrgUser(
      user.organizationUsers.map((ou) => ({
        id: ou.id,
        role: ou.role,
        organizationId: ou.organizationId,
        organization: {
          id: ou.organization.id,
          name: ou.organization.name,
          slug: ou.organization.slug,
        },
      }))
    );

    if (!primaryOrgUser) {
      return forbidden('No organization assigned');
    }

    const isEmailVerified = user.emailVerified !== null;
    const isPhoneVerified = user.phoneVerified !== null;

    let role = primaryOrgUser.role;
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (adminEmail && user.email.toLowerCase() === adminEmail) {
      role = 'SYSTEM_ADMIN';
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      phoneVerified: isPhoneVerified,
      emailVerified: isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      avatarUrl: user.avatarUrl,
      role,
      consentNotifications: user.consentNotifications,
      consentMarketing: user.consentMarketing,
      consentTransactional: user.consentTransactional,
      organizationUserId: primaryOrgUser.id,
      organization: {
        id: primaryOrgUser.organization.id,
        name: primaryOrgUser.organization.name,
        slug: primaryOrgUser.organization.slug,
      },
    };

    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = await getAccessTokenFromRequest(request);

    if (!token) {
      return unauthorized('No access token provided');
    }

    let payload: {
      userId: string;
      type?: 'access';
    };

    try {
      payload = verifyAccessToken(token);
    } catch {
      return unauthorized('Invalid or expired token');
    }

    if (payload.type && payload.type !== 'access') {
      return unauthorized('Invalid token type');
    }

    const rawBody = await request.json().catch(() => null);
    const parsed = UpdatePreferencesSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      );
    }

    const { consentNotifications, consentMarketing } = parsed.data;

    const updateData: {
      consentNotifications?: boolean;
      consentMarketing?: boolean;
    } = {};

    if (typeof consentNotifications === 'boolean') {
      updateData.consentNotifications = consentNotifications;
    }

    if (typeof consentMarketing === 'boolean') {
      updateData.consentMarketing = consentMarketing;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true },
    });

    if (!existingUser) {
      return unauthorized('Session is no longer valid');
    }

    if (existingUser.status !== 'ACTIVE') {
      return forbidden('Account is not active');
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: {
        consentNotifications: true,
        consentMarketing: true,
        consentTransactional: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
