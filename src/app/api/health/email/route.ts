import { NextResponse } from 'next/server';
import { isSmtpConfigured, verifySmtpConnection } from '@/lib/mail';

const DEFAULT_CACHE_TTL_MS = 30_000;
const MIN_CACHE_TTL_MS = 5_000;
const MAX_CACHE_TTL_MS = 300_000;

function getCacheTtlMs() {
  const raw = Number(process.env.EMAIL_HEALTH_CACHE_TTL_MS);
  if (!Number.isFinite(raw)) {
    return DEFAULT_CACHE_TTL_MS;
  }
  return Math.min(MAX_CACHE_TTL_MS, Math.max(MIN_CACHE_TTL_MS, Math.floor(raw)));
}

type SmtpStatus = Awaited<ReturnType<typeof verifySmtpConnection>>;

let cachedSmtpStatus: {
  value: SmtpStatus;
  expiresAt: number;
} | null = null;

function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

function extractHealthToken(request: Request) {
  const headerToken = request.headers.get('x-health-token')?.trim();
  if (headerToken) {
    return headerToken;
  }

  const authHeader = request.headers.get('authorization')?.trim();
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  return '';
}

function isAuthorized(request: Request, isProduction: boolean) {
  const expectedToken = process.env.EMAIL_HEALTH_TOKEN;

  // Fail closed in production if no health token is configured.
  if (!expectedToken) {
    return !isProduction;
  }

  const providedToken = extractHealthToken(request);
  return providedToken.length > 0 && providedToken === expectedToken;
}

async function getCachedSmtpStatus() {
  const now = Date.now();
  if (cachedSmtpStatus && cachedSmtpStatus.expiresAt > now) {
    return cachedSmtpStatus.value;
  }

  const freshStatus = await verifySmtpConnection();
  cachedSmtpStatus = {
    value: freshStatus,
    expiresAt: now + getCacheTtlMs(),
  };

  return freshStatus;
}

export async function GET(request: Request) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isAuthorized(request, isProduction)) {
    return noStore(
      NextResponse.json(
        {
          ok: false,
          configured: false,
          message: 'Unauthorized health check request.',
        },
        { status: 401 }
      )
    );
  }

  try {
    const smtpStatus = await getCachedSmtpStatus();

    // Keep production response generic to avoid exposing internals.
    if (isProduction) {
      return noStore(
        NextResponse.json(
          {
            ok: smtpStatus.ok,
            configured: isSmtpConfigured(),
            message: smtpStatus.ok ? 'Email service is healthy.' : 'Email service is unavailable.',
          },
          { status: smtpStatus.ok ? 200 : 503 }
        )
      );
    }

    return noStore(
      NextResponse.json(
        {
          ok: smtpStatus.ok,
          configured: isSmtpConfigured(),
          message: smtpStatus.message,
          missingSmtpVars: smtpStatus.missingSmtpVars,
          error: !smtpStatus.ok && 'error' in smtpStatus ? smtpStatus.error : undefined,
          environment: process.env.NODE_ENV || 'development',
        },
        { status: smtpStatus.ok ? 200 : 503 }
      )
    );
  } catch (error) {
    if (isProduction) {
      return noStore(
        NextResponse.json(
          {
            ok: false,
            configured: isSmtpConfigured(),
            message: 'Email health check failed.',
          },
          { status: 500 }
        )
      );
    }

    return noStore(
      NextResponse.json(
        {
          ok: false,
          configured: false,
          message: 'Email health check failed.',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    );
  }
}
