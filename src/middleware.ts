import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
  SYSTEM_ADMIN: ["/admin"],
  PROPERTY_MANAGER: ["/property-manager"],
  TENANT: ["/tenant"],
  VENDOR: ["/vendor"],
  AGENT: ["/agent"],
};

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/services",
  "/plans",
  "/blog",
  "/marketplace",
  "/unauthorized",
];

// Helper to remove trailing slas
const normalizePath = (path: string) => path.replace(/\/$/, "");

function matchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(prefix + "/");
}

const decodeJWT = (token: string): { role?: string } => {
  try {
    const parts = token.split(".");
    const payload = parts[1];
    if (!payload) return {};
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return {};
  }
};

export function middleware(request: NextRequest) {
  const rawPath = request.nextUrl.pathname;
  const pathname = normalizePath(rawPath);
  const token = request.cookies.get("token")?.value;

  // Skip static assets eg images and favicons early
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // check public routes and allow their corresponding subroutes too
  // for example signup/landloard
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    matchesPrefix(pathname, normalizePath(route))
  );

  if (isPublicRoute) {
    console.log("Public route allowed:", pathname);

    if (token && pathname === "/") {
      const { role } = decodeJWT(token);
      const roleHome = role && ROLE_ROUTES[role]?.[0];
      if (roleHome) {
        return NextResponse.redirect(new URL(roleHome, request.url));
      }
    }
    return NextResponse.next();
  }

  // If No token redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // preserve original URL
    loginUrl.searchParams.set("redirect", rawPath);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = decodeJWT(token);
  if (!role || !ROLE_ROUTES[role]) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const allowedPrefixes = ROLE_ROUTES[role];

  if (!allowedPrefixes) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const hasAccess = allowedPrefixes.some((prefix) =>
    matchesPrefix(pathname, prefix)
  );

  if (!hasAccess) {
    const redirectTarget = allowedPrefixes[0];
    if (redirectTarget) {
      return NextResponse.redirect(
        new URL(redirectTarget, request.url)
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled internally)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - all images/files in public (using regex)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
  ],
};
