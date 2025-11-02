import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/admin', '/property-manager', '/tenant', '/vendor', '/dashboard'];
const publicRoutes = ['/login', '/signup', '/', '/services', '/plans', '/blog', '/marketplace', '/unauthorized'];

const roleDashboards = {
  SYSTEM_ADMIN: '/admin',
  PROPERTY_MANAGER: '/property-manager',
  TENANT: '/tenant',
  VENDOR: '/vendor',
};

const routePermissions = {
  '/admin': ['SYSTEM_ADMIN'],
  '/property-manager': ['PROPERTY_MANAGER'],
  '/tenant': ['TENANT'],
  '/vendor': ['VENDOR'],
};

// Decode JWT safely
const decodeJWT = (token: string): { role?: string } => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch (error) {
    console.log('JWT decode error:', error);
    return {};
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Skip non-page requests (static files, favicon, _next, etc.)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    /\.(svg|png|jpg|jpeg|gif|webp|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // 1️⃣ Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2️⃣ Role-based access for protected routes
  if (token && isProtectedRoute) {
    const decoded = decodeJWT(token);
    const userRole = decoded?.role;

    if (!userRole) {
      // Token exists but no role: force login to refresh
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const applicableRoute = Object.keys(routePermissions).find(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );

    if (applicableRoute) {
      const allowedRoles = routePermissions[applicableRoute as keyof typeof routePermissions];
      const hasAccess = allowedRoles.includes(userRole);

      if (!hasAccess) {
        const userDashboard = roleDashboards[userRole as keyof typeof roleDashboards];
        if (pathname !== userDashboard) {
          return NextResponse.redirect(new URL(userDashboard, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};
