"use client";

import { motion } from "framer-motion";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";
import { DashboardNavbar } from "@/components/Dashboard/DashboardNavbar";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </DashboardProvider>
    </ProtectedRoute>
  );
}

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isSidebarCollapsed, toggleSidebar, setMobileDrawerOpen } =
    useDashboard();
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allowedPaths = {
    SYSTEM_ADMIN: "/admin",
    PROPERTY_MANAGER: "/property-manager",
    TENANT: "/tenant",
    VENDOR: "/vendor",
    // Add default roles if needed or handle fallback
  } as const;

  useEffect(() => {
    if (!isLoading && user && isMounted) {
      const expectedPath = allowedPaths[user.role as keyof typeof allowedPaths];
      if (expectedPath && !pathname.startsWith(expectedPath) && !pathname.startsWith('/account')) {
        router.push(expectedPath);
      }
    }
  }, [user, isLoading, isMounted, pathname, router]);

  // Prevent Hydration Mismatch
  if (!isMounted) {
    return null;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Sidebar with dark background */}
      <div className="bg-[#003b73] text-white">
        <DashboardSidebar
          user={user}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar with dark background */}
        <header className="flex-shrink-0 z-10 bg-[#003b73] border-b border-[#002b5b] text-white">
          <DashboardNavbar
            toggleSidebar={() => setMobileDrawerOpen(true)}
          />
        </header>

        {/* Main area - fills the whole content, no margins */}
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 overflow-y-auto bg-gray-50 m-0 p-0"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
