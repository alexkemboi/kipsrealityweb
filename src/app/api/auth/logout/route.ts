import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

import { prisma } from '@/lib/db';
import { verifyRefreshToken } from '@/lib/auth';
import { hashToken } from '@/lib/token-security';

type LogoutScope = 'CURRENT_SESSION' | 'ALL_SESSIONS';

function getRequestContext(request: Request) {
  const url = new URL(request.url);
  const headerStore = headers();

  const forwardedProto = headerStore.get('x-forwarded-proto');
  const forwardedHost = headerStore.get('x-forwarded-host');
  const host = headerStore.get('host');

  const isHttps =
    forwardedProto ? forwardedProto === 'https' : url.protocol === 'https:';

  const hostname = forwardedHost || host || url.hostname || '';
  const isLocal =
    hostname.includes('localhost') ||
    hostname.startsWith('127.0.0.1') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local');

  return { isHttps, isLocal };
}

function clearCookie(response: NextResponse, request: Request, name: string) {
  const { isHttps, isLocal } = getRequestContext(request);
  const secure = isHttps && !isLocal;

  response.cookies.set(name, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}

function clearAuthCookies(response: NextResponse, request: Request) {
  clearCookie(response, request, 'token');
  clearCookie(response, request, 'refreshToken');
}

function getClientIp(): string | null {
  const headerStore = headers();
  const xff = headerStore.get('x-forwarded-for');
  if (!xff) return null;
  return xff.split(',')[0]?.trim() ?? null;
}

function getUserAgent(): string | null {
  return headers().get('user-agent');
}

function normalizeLogoutScope(value: unknown): LogoutScope {
  if (typeof value !== 'string') return 'CURRENT_SESSION';
  return value === 'ALL_SESSIONS' ? 'ALL_SESSIONS' : 'CURRENT_SESSION';
}

export async function POST(request: Request) {
  // Idempotent success response (best UX / common auth practice)
  const response = NextResponse.json(
    {
      success: true,
      message: 'Logged out successfully',
    },
    { status: 200 }
  );

  try {
    // Optional request body support:
    // { "scope": "ALL_SESSIONS" } to revoke every device/session
    let scope: LogoutScope = 'CURRENT_SESSION';
    try {
      const body = await request.json().catch(() => null);
      scope = normalizeLogoutScope(body?.scope);
    } catch {
      // No body or invalid JSON -> default CURRENT_SESSION
      scope = 'CURRENT_SESSION';
    }

    const refreshToken = cookies().get('refreshToken')?.value ?? null;

    // No refresh token cookie = already logged out / expired session
    if (!refreshToken) {
      clearAuthCookies(response, request);
      return response;
    }

    let payload: {
      userId: string;
      sessionId?: string;
      jti?: string;
      type?: 'refresh';
    };

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      // Invalid/expired token: clear cookies and return success
      clearAuthCookies(response, request);
      return response;
    }

    if (payload.type && payload.type !== 'refresh') {
      clearAuthCookies(response, request);
      return response;
    }

    const now = new Date();
    const ip = getClientIp();
    const userAgent = getUserAgent();

    // Hash incoming refresh token (useful for optional strict match / audit evidence)
    const incomingTokenHash = await hashToken(refreshToken);

    if (scope === 'ALL_SESSIONS') {
      // Revoke all active sessions for user (all devices)
      await prisma.$transaction([
        prisma.refreshSession.updateMany({
          where: {
            userId: payload.userId,
            revokedAt: null,
          },
          data: {
            revokedAt: now,
            revokeReason: 'USER_LOGOUT_ALL',
            lastUsedAt: now,
            lastUsedByIp: ip,
            userAgent: userAgent ?? undefined,
          },
        }),

        // Optional auth audit log (uncomment if table exists)
        // prisma.authAuditLog.create({
        //   data: {
        //     userId: payload.userId,
        //     event: 'LOGOUT_ALL_SUCCESS',
        //     ipAddress: ip,
        //     userAgent,
        //   },
        // }),
      ]);

      clearAuthCookies(response, request);
      return response;
    }

    // CURRENT_SESSION logout (single device/session)
    if (payload.sessionId) {
      // Strict revocation path:
      // 1) Find active session record
      // 2) Optionally verify tokenHash matches current session tokenHash
      // 3) Revoke session

      const session = await prisma.refreshSession.findUnique({
        where: { id: payload.sessionId },
        select: {
          id: true,
          userId: true,
          tokenHash: true,
          revokedAt: true,
          expiresAt: true,
        },
      });

      if (
        session &&
        session.userId === payload.userId &&
        session.revokedAt === null &&
        session.expiresAt > now
      ) {
        // Optional strict check:
        // Only revoke if presented token matches the currently stored active token.
        // If mismatch, still revoke as a defensive measure (possible stale/replayed token).
        const revokeReason =
          session.tokenHash === incomingTokenHash
            ? 'USER_LOGOUT'
            : 'USER_LOGOUT_TOKEN_MISMATCH';

        await prisma.$transaction([
          prisma.refreshSession.updateMany({
            where: {
              id: payload.sessionId,
              userId: payload.userId,
              revokedAt: null,
            },
            data: {
              revokedAt: now,
              revokeReason,
              lastUsedAt: now,
              lastUsedByIp: ip,
              userAgent: userAgent ?? undefined,
            },
          }),

          // Optional auth audit log (uncomment if table exists)
          // prisma.authAuditLog.create({
          //   data: {
          //     userId: payload.userId,
          //     event: 'LOGOUT_SUCCESS',
          //     ipAddress: ip,
          //     userAgent,
          //     metadata: { sessionId: payload.sessionId, revokeReason },
          //   },
          // }),
        ]);
      } else {
        // Backward compatibility / already-rotated token / missing session:
        // fail closed for current session by revoking all active sessions for this user.
        await prisma.refreshSession.updateMany({
          where: {
            userId: payload.userId,
            revokedAt: null,
          },
          data: {
            revokedAt: now,
            revokeReason: 'USER_LOGOUT_FALLBACK_ALL',
            lastUsedAt: now,
            lastUsedByIp: ip,
            userAgent: userAgent ?? undefined,
          },
        });
      }
    } else {
      // Legacy refresh tokens without sessionId claim -> revoke all sessions for safety
      await prisma.refreshSession.updateMany({
        where: {
          userId: payload.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
          revokeReason: 'USER_LOGOUT_LEGACY_TOKEN',
          lastUsedAt: now,
          lastUsedByIp: ip,
          userAgent: userAgent ?? undefined,
        },
      });
    }

    clearAuthCookies(response, request);
    return response;
  } catch (error) {
    console.error('Logout error:', error);

    // Security/UX: always clear cookies even if DB revocation fails
    clearAuthCookies(response, request);
    return response;
  }
}
