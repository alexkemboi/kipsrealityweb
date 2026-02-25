"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardNavbar } from "@/components/Dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

type AppUserRole =
  | "SYSTEM_ADMIN"
  | "PROPERTY_MANAGER"
  | "TENANT"
  | "VENDOR"
  | "AGENT";

type RoleAccessConfig = {
  home: string;
  allowedPrefixes: readonly string[];
};

const ROLE_ACCESS: Record<AppUserRole, RoleAccessConfig> = {
  SYSTEM_ADMIN: {
    home: "/admin",
    allowedPrefixes: ["/admin", "/reports", "/analytics"],
  },
  PROPERTY_MANAGER: {
    home: "/property-manager",
    allowedPrefixes: ["/property-manager", "/reports"],
  },
  TENANT: {
    home: "/tenant",
    allowedPrefixes: ["/tenant"],
  },
  VENDOR: {
    home: "/vendor",
    allowedPrefixes: ["/vendor"],
  },
  AGENT: {
    home: "/agent",
    allowedPrefixes: ["/agent"],
  },
};

const SHARED_ROUTE_PREFIXES: readonly string[] = [
  "/account",
  "/profile",
  "/settings",
  "/help",
  "/notifications",
];

const NEVER_REDIRECT_PREFIXES: readonly string[] = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const SHARED_EXACT_ROUTES: readonly string[] = ["/"];

function isAppUserRole(role: unknown): role is AppUserRole {
  return (
    typeof role === "string" &&
    Object.prototype.hasOwnProperty.call(ROLE_ACCESS, role)
  );
}

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function matchesAnyPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => matchesRoutePrefix(pathname, prefix));
}

function matchesAnyExact(pathname: string, exactRoutes: readonly string[]): boolean {
  return exactRoutes.includes(pathname);
}

function shouldSkipRoleRedirect(pathname: string): boolean {
  return (
    matchesAnyExact(pathname, SHARED_EXACT_ROUTES) ||
    matchesAnyPrefix(pathname, SHARED_ROUTE_PREFIXES) ||
    matchesAnyPrefix(pathname, NEVER_REDIRECT_PREFIXES)
  );
}

function getRoleAccess(role: unknown): RoleAccessConfig | null {
  if (!isAppUserRole(role)) return null;
  return ROLE_ACCESS[role];
}

function isPathAllowedForRole(pathname: string, roleAccess: RoleAccessConfig): boolean {
  return matchesAnyPrefix(pathname, roleAccess.allowedPrefixes);
}

function getRedirectTargetForRolePath(role: unknown, pathname: string): string | null {
  const roleAccess = getRoleAccess(role);
  if (!roleAccess) return null;
  if (!pathname) return null;
  if (shouldSkipRoleRedirect(pathname)) return null;
  if (isPathAllowedForRole(pathname, roleAccess)) return null;
  return roleAccess.home;
}

function FullScreenSpinner({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>
    </div>
  );
}

function DashboardShellSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="w-16 bg-[#003b73]" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="h-14 border-b border-[#002b5b] bg-[#003b73]" />
        <main className="flex-1 bg-gray-50 p-4">
          <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <DashboardProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </DashboardProvider>
    </ProtectedRoute>
  );
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const { isSidebarCollapsed, toggleSidebar, setMobileDrawerOpen } = useDashboard();

  const pathname = usePathname() ?? "";
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const roleAccess = getRoleAccess(user?.role);
  const redirectTarget = getRedirectTargetForRolePath(user?.role, pathname);

  const shouldRedirect =
    isMounted && !isLoading && !!user && !!roleAccess && !!redirectTarget;

  useEffect(() => {
    if (!shouldRedirect || !redirectTarget) return;
    if (lastRedirectRef.current === redirectTarget) return;

    lastRedirectRef.current = redirectTarget;
    router.replace(redirectTarget);
  }, [shouldRedirect, redirectTarget, router]);

  useEffect(() => {
    lastRedirectRef.current = null;
  }, [pathname]);

  if (!isMounted) return <DashboardShellSkeleton />;
  if (isLoading || !user) return <FullScreenSpinner label="Loading dashboard..." />;
  if (shouldRedirect) return <FullScreenSpinner label="Redirecting..." />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="bg-[#003b73] text-white">
        <DashboardSidebar
          user={user}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex-shrink-0 border-b border-[#002b5b] bg-[#003b73] text-white">
          <DashboardNavbar toggleSidebar={() => setMobileDrawerOpen(true)} />
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="m-0 flex-1 overflow-y-auto bg-gray-50 p-0"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
