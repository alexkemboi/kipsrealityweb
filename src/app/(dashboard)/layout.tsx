"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

/**
 * Keep this union in sync with your backend/prisma user roles if needed.
 * If your `user.role` is already strongly typed from AuthContext, you can replace this.
 */
type AppUserRole =
  | "SYSTEM_ADMIN"
  | "PROPERTY_MANAGER"
  | "TENANT"
  | "VENDOR"
  | "AGENT";

const ROLE_HOME_PATH: Record<AppUserRole, string> = {
  SYSTEM_ADMIN: "/admin",
  PROPERTY_MANAGER: "/property-manager",
  TENANT: "/tenant",
  VENDOR: "/vendor",
  AGENT: "/agent",
};

/**
 * Routes accessible regardless of role section.
 * Add more shared pages here as your app grows.
 */
const SHARED_ROUTE_PREFIXES = [
  "/account",
  "/profile",
  "/settings",
  "/help",
  "/notifications",
] as const;

/**
 * Optional auth routes you may want to ignore for redirection if this layout
 * ever wraps them accidentally.
 */
const NEVER_REDIRECT_PREFIXES = ["/login", "/register", "/forgot-password"] as const;

function startsWithAny(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

function getRoleHomePath(role: unknown): string | null {
  if (typeof role !== "string") return null;
  if (role in ROLE_HOME_PATH) {
    return ROLE_HOME_PATH[role as AppUserRole];
  }
  return null;
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
  const { isSidebarCollapsed, toggleSidebar, setMobileDrawerOpen } =
    useDashboard();

  const pathname = usePathname();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  // Prevent repeated replace() calls for the same path in edge hydration states
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const roleHomePath = useMemo(() => getRoleHomePath(user?.role), [user?.role]);

  const shouldSkipRedirect = useMemo(() => {
    if (!pathname) return true;
    return (
      startsWithAny(pathname, SHARED_ROUTE_PREFIXES) ||
      startsWithAny(pathname, NEVER_REDIRECT_PREFIXES)
    );
  }, [pathname]);

  useEffect(() => {
    if (!isMounted) return;
    if (isLoading) return;
    if (!user) return;
    if (!pathname) return;
    if (!roleHomePath) return; // Unknown/new role -> don't force redirect blindly
    if (shouldSkipRedirect) return;

    const alreadyInRoleSection = pathname.startsWith(roleHomePath);
    if (alreadyInRoleSection) return;

    if (lastRedirectRef.current === roleHomePath) return;
    lastRedirectRef.current = roleHomePath;

    router.replace(roleHomePath);
  }, [isMounted, isLoading, user, pathname, roleHomePath, shouldSkipRedirect, router]);

  // Reset redirect guard when pathname changes successfully
  useEffect(() => {
    lastRedirectRef.current = null;
  }, [pathname]);

  // Prevent hydration mismatch flashes
  if (!isMounted) return null;

  // Loading / auth pending state
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="bg-[#003b73] text-white">
        <DashboardSidebar
          user={user}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="z-10 flex-shrink-0 border-b border-[#002b5b] bg-[#003b73] text-white">
          <DashboardNavbar toggleSidebar={() => setMobileDrawerOpen(true)} />
        </header>

        {/* Animated page content */}
        <motion.main
          key={pathname} // re-run animation on route change
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
