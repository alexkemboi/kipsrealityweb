import { NextResponse } from 'next/server';
import { isSmtpConfigured, verifySmtpConnection } from '@/lib/mail';

function noStore(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export async function GET() {
  try {
    const smtpStatus = await verifySmtpConnection();
    const isProduction = process.env.NODE_ENV === 'production';

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
          error: smtpStatus.ok ? undefined : smtpStatus.error,
          environment: process.env.NODE_ENV || 'development',
        },
        { status: smtpStatus.ok ? 200 : 503 }
      )
    );
  } catch (error) {
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
