import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

function setEnv(name: string, value: string) {
  (process.env as Record<string, string | undefined>)[name] = value;
}

async function loadRoute({
  verifyImplementation,
  configured = true,
}: {
  verifyImplementation: () => Promise<{
    ok: boolean;
    missingSmtpVars: string[];
    message: string;
    error?: string;
  }>;
  configured?: boolean;
}) {
  const verifySpy = vi.fn(verifyImplementation);
  const configuredSpy = vi.fn(() => configured);

  vi.doMock('@/lib/mail', () => ({
    verifySmtpConnection: verifySpy,
    isSmtpConfigured: configuredSpy,
  }));

  const route = await import('@/app/api/health/email/route');

  return {
    GET: route.GET,
    verifySpy,
    configuredSpy,
  };
}

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  process.env = { ...originalEnv };
});

describe('email health route hardening', () => {
  it('returns 401 in production when token is missing', async () => {
    setEnv('NODE_ENV', 'production');
    setEnv('EMAIL_HEALTH_TOKEN', 'secret-token');

    const { GET, verifySpy } = await loadRoute({
      verifyImplementation: async () => ({
        ok: true,
        missingSmtpVars: [],
        message: 'SMTP connection verified.',
      }),
    });

    const response = await GET(new Request('http://localhost/api/health/email'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe('Unauthorized health check request.');
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it('returns generic production response when authorized', async () => {
    setEnv('NODE_ENV', 'production');
    setEnv('EMAIL_HEALTH_TOKEN', 'secret-token');

    const { GET } = await loadRoute({
      verifyImplementation: async () => ({
        ok: true,
        missingSmtpVars: [],
        message: 'SMTP connection verified.',
      }),
      configured: true,
    });

    const response = await GET(
      new Request('http://localhost/api/health/email', {
        headers: {
          'x-health-token': 'secret-token',
        },
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      configured: true,
      message: 'Email service is healthy.',
    });
  });

  it('does not leak internal errors in production', async () => {
    setEnv('NODE_ENV', 'production');
    setEnv('EMAIL_HEALTH_TOKEN', 'secret-token');

    const { GET } = await loadRoute({
      verifyImplementation: async () => {
        throw new Error('sensitive smtp network failure');
      },
      configured: false,
    });

    const response = await GET(
      new Request('http://localhost/api/health/email', {
        headers: {
          authorization: 'Bearer secret-token',
        },
      })
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      ok: false,
      configured: false,
      message: 'Email health check failed.',
    });
    expect('error' in body).toBe(false);
  });

  it('caches SMTP health checks within configured TTL', async () => {
    setEnv('NODE_ENV', 'development');
    setEnv('EMAIL_HEALTH_CACHE_TTL_MS', '60000');

    const { GET, verifySpy } = await loadRoute({
      verifyImplementation: async () => ({
        ok: false,
        missingSmtpVars: [],
        message: 'SMTP connection failed.',
        error: 'ECONNREFUSED',
      }),
      configured: true,
    });

    const request = new Request('http://localhost/api/health/email');
    const firstResponse = await GET(request);
    const secondResponse = await GET(request);

    expect(firstResponse.status).toBe(503);
    expect(secondResponse.status).toBe(503);
    expect(verifySpy).toHaveBeenCalledTimes(1);
  });
});
