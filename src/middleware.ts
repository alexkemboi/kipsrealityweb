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
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Skip public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    if (token && pathname === "/") {
      const { role } = decodeJWT(token);
      const roleHome = role && ROLE_ROUTES[role]?.[0];
      if (roleHome) {
        return NextResponse.redirect(
          new URL(roleHome, request.url)
        );
      }
    }
    return NextResponse.next();
  }

  // Skip static & API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // No token → login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
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
  matcher: ["/((?!_next|favicon.ico).*)"],
};
