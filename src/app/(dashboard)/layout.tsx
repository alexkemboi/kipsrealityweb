"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardProvider } from "@/context/DashboardContext";
import { DashboardNavbar } from "@/components/Dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Role to path mapping (from middleware)
const ROLE_HOME_PATHS: Record<string, string> = {
  SYSTEM_ADMIN: "/admin",
  PROPERTY_MANAGER: "/property-manager",
  TENANT: "/tenant",
  VENDOR: "/vendor",
  AGENT: "/agent",
};

// Check if user has access to the current path based on their role
function hasAccessToPath(pathname: string, role: string): boolean {
  const homePath = ROLE_HOME_PATHS[role];
  if (!homePath) return false;
  
  // Check if pathname starts with the role's home path
  return pathname === homePath || pathname.startsWith(homePath + "/");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration before doing any redirects
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Role-based redirect logic - defense in depth
  // If middleware fails, this client-side check ensures users don't see unauthorized content
  useEffect(() => {
    // Only run after both auth is loaded and component is hydrated
    if (authLoading || !isHydrated || !user) return;

    const userRole = user.role;
    const allowedPath = ROLE_HOME_PATHS[userRole];

    // If user doesn't have a valid role mapping, redirect to login
    if (!allowedPath) {
      router.push("/login");
      return;
    }

    // Check if current path is allowed for user's role
    if (!hasAccessToPath(pathname, userRole)) {
      // Redirect to user's home dashboard
      router.push(allowedPath);
    }
  }, [user, authLoading, isHydrated, pathname, router]);

  // Show loading state while checking auth
  if (authLoading || !isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#003b73] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <aside className="bg-[#003b73] text-white">
            <DashboardSidebar user={user} />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <header className="border-b border-[#002b5b] bg-[#003b73] text-white">
              <DashboardNavbar user={user} />
            </header>

            <main className="flex-1 overflow-y-auto bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </DashboardProvider>
    </ProtectedRoute>
  );
}
