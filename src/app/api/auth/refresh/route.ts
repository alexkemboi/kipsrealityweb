import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getRequestContext(request: Request) {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = request.headers.get('host');

  const isHttps = forwardedProto
    ? forwardedProto.toLowerCase().includes('https')
    : url.protocol === 'https:';

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

function selectPrimaryOrgUser(
  organizationUsers: Array<{
    id: string;
    role: string;
    organizationId: string;
    organization: { id: string; name: string; slug: string };
  }>
) {
  if (!organizationUsers?.length) return null;
  const privileged = organizationUsers.find((ou) => ou.role !== 'TENANT');
  return privileged ?? organizationUsers[0];
}

export async function POST(request: Request) {
  try {
    // ✅ Read refresh token from HTTP-only cookie (preferred)
    const cookieHeader = request.headers.get('cookie') ?? '';
    const refreshToken = cookieHeader
      .split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith('refreshToken='))
      ?.split('=')[1];

    if (!refreshToken) {
      const response = NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
      clearAuthCookies(response, request);
      return response;
    }

    const payload = verifyRefreshToken(decodeURIComponent(refreshToken));

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        organizationUsers: {
          include: { organization: true },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
      clearAuthCookies(response, request);
      return response;
    }

    const primaryOrgUser = selectPrimaryOrgUser(
      user.organizationUsers.map((ou) => ({
        id: ou.id,
        role: String(ou.role),
        organizationId: ou.organizationId,
        organization: {
          id: ou.organization.id,
          name: ou.organization.name,
          slug: ou.organization.slug,
        },
      }))
    );

    if (!primaryOrgUser) {
      const response = NextResponse.json({ error: 'No organization assigned' }, { status: 403 });
      clearAuthCookies(response, request);
      return response;
    }

    let role = primaryOrgUser.role;
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (adminEmail && user.email.toLowerCase() === adminEmail) {
      role = 'SYSTEM_ADMIN';
    }

    // ✅ Rotate BOTH tokens (best practice)
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role,
      organizationId: primaryOrgUser.organizationId,
      organizationUserId: primaryOrgUser.id,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
    });

    const expiresAt = Date.now() + ACCESS_TOKEN_MAX_AGE_SECONDS * 1000;

    const response = NextResponse.json(
      {
        session: { expiresAt },
      },
      { status: 200 }
    );

    setAuthCookies(response, request, newAccessToken, newRefreshToken);
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    clearAuthCookies(response, request);
    return response;
  }
}
