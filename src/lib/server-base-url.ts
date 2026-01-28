import 'server-only';

import { headers } from 'next/headers';

/**
 * Returns an absolute base URL for server-side fetch() calls.
 *
 * Prefer setting NEXT_PUBLIC_BASE_URL in production, but this makes local dev
 * and preview environments work even when it's missing.
 */
export async function getServerBaseUrl(): Promise<string> {
  const fromEnv =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.VERCEL_URL;

  if (fromEnv) {
    return fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`;
  }

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'http';

  if (host) return `${proto}://${host}`;

  // Removed hardcoded fallback to localhost
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('Environment variable NEXT_PUBLIC_BASE_URL is not set.');
  }
  return baseUrl;
}
