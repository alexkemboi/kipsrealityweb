import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/admin',
  '/property-manager',
  '/tenant',
  '/vendor',
  '/dashboard'
]

const publicRoutes = [
  '/login',
  '/signup',
  '/',
  '/services',
  '/plans',
  '/blog',
  '/marketplace',
  '/unauthorized'
]

// Role-based dashboard mapping
const roleDashboards = {
  SYSTEM_ADMIN: '/admin',
  PROPERTY_MANAGER: '/property-manager',
  TENANT: '/tenant',
  VENDOR: '/vendor'
}

// Role-based access rules - which roles can access which routes
const routePermissions = {
  '/admin': ['SYSTEM_ADMIN'],
  '/property-manager': ['PROPERTY_MANAGER'],
  '/tenant': ['TENANT'],
  '/vendor': ['VENDOR']
}

const decodeJWT = (token: string): { role?: string } => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.log('JWT decode error:', error);
    return {};
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. NEW: Check role-based access for protected routes with token
  if (token && isProtectedRoute) {
    const decoded = decodeJWT(token);
    const userRole = decoded?.role;

    if (userRole) {
      // Find which route permission rule applies to current path
      const applicableRoute = Object.keys(routePermissions).find(route =>
        pathname === route || pathname.startsWith(route + '/')
      );

      if (applicableRoute) {
        const allowedRoles = routePermissions[applicableRoute as keyof typeof routePermissions];
        const hasAccess = allowedRoles.includes(userRole);

        if (!hasAccess) {
          // User doesn't have access to this route - redirect to their dashboard
          const userDashboard = roleDashboards[userRole as keyof typeof roleDashboards];
          return NextResponse.redirect(new URL(userDashboard, request.url));
        }
      }
    } else {
      console.log('No role found in token');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};