import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTwoFactorChallengeToken, // make sure this exists in @/lib/auth
} from '@/lib/auth';

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const TWO_FA_CHALLENGE_TTL_SECONDS = 60 * 5; // 5 minutes

// Dummy bcrypt hash to reduce timing differences for unknown users
const DUMMY_BCRYPT_HASH =
  '$2a$10$7EqJtq98hPqEX7fNZaFWoO.H8Jm0G7K8G5x1L6K2f8M4QYwz7lB9K';

const LoginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(1024),
});

type OrgUserLite = {
  id: string;
  role: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};

function getRequestContext(request: Request) {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = request.headers.get('host');

  const isHttps =
    forwardedProto ? forwardedProto === 'https' : url.protocol === 'https:';

  const hostname = (forwardedHost || host || url.hostname || '').toLowerCase();

  const isLocal =
    hostname.includes('localhost') ||
    hostname.startsWith('127.0.0.1') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local');

  return { isHttps, isLocal };
}

function setAuthCookies(
  response: NextResponse,
  request: Request,
  accessToken: string,
  refreshToken: string
) {
  const { isHttps, isLocal } = getRequestContext(request);
  const secure = isHttps && !isLocal;

  response.cookies.set('token', accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

function clearAuthCookies(response: NextResponse, request: Request) {
  const { isHttps, isLocal } = getRequestContext(request);
  const secure = isHttps && !isLocal;

  response.cookies.set('token', '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}

function authFailureResponse() {
  // Generic error to avoid user enumeration
  return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
}

function selectPrimaryOrgUser(organizationUsers: OrgUserLite[]) {
  if (!organizationUsers?.length) return null;

  // Prefer non-tenant role if available, otherwise first record
  const privileged = organizationUsers.find((ou) => ou.role !== 'TENANT');
  return privileged ?? organizationUsers[0];
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    const parsed = LoginSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizationUsers: {
          include: { organization: true },
        },
      },
    });

    // Anti-enumeration + safe compare when user missing or no password set
    if (!user || !user.passwordHash) {
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH).catch(() => false);
      return authFailureResponse();
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return authFailureResponse();
    }

    // Check account status after password validation (reduces enumeration signals)
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is not active. Please contact support.' },
        { status: 403 }
      );
    }

    const isEmailVerified = user.emailVerified !== null;
    if (!isEmailVerified) {
      return NextResponse.json(
        {
          error: 'Please verify your email address before logging in.',
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // If 2FA is enabled, do not issue session tokens yet
    if (user.twoFactorEnabled) {
      const challengeToken = generateTwoFactorChallengeToken({
        userId: user.id,
        email: user.email,
        purpose: 'LOGIN_2FA',
      });

      return NextResponse.json(
        {
          require2FA: true,
          challengeToken,
          challengeExpiresIn: TWO_FA_CHALLENGE_TTL_SECONDS,
          message: 'Two-factor authentication required. Please enter your verification code.',
        },
        { status: 200 }
      );
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

    let role = primaryOrgUser?.role ?? 'TENANT';

    // Force platform admin role for configured admin email
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (adminEmail && email === adminEmail) {
      role = 'SYSTEM_ADMIN';
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role,
      organizationId: primaryOrgUser?.organizationId ?? '',
      organizationUserId: primaryOrgUser?.id,
      type: 'access',
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      type: 'refresh',
    });

    // Access token expiry aligned to cookie maxAge
    const expiresAt = Date.now() + ACCESS_TOKEN_MAX_AGE_SECONDS * 1000;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // If you persist refresh sessions for rotation/revocation, create it here.
    // Uncomment/adapt only if your RefreshSession schema fields match.
    /*
    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
      },
    });
    */

    const isPhoneVerified = user.phoneVerified !== null;

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
      organizationUserId: primaryOrgUser?.id ?? null,
      organization: primaryOrgUser
        ? {
            id: primaryOrgUser.organization.id,
            name: primaryOrgUser.organization.name,
            slug: primaryOrgUser.organization.slug,
          }
        : null,
    };

    // Cookie-based auth: do not return raw tokens in JSON
    const response = NextResponse.json(
      {
        user: userResponse,
        session: { expiresAt },
      },
      { status: 200 }
    );

    clearAuthCookies(response, request);
    setAuthCookies(response, request, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
