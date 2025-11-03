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

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isSidebarCollapsed, toggleSidebar, setMobileDrawerOpen } = useDashboard();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const allowedPaths = {
    SYSTEM_ADMIN: "/admin",
    PROPERTY_MANAGER: "/property-manager",
    TENANT: "/tenant",
    VENDOR: "/dashboard/vendor",
  } as const;

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const expectedPath = allowedPaths[user.role as keyof typeof allowedPaths];

  if (expectedPath && !currentPath.startsWith(expectedPath)) {
    redirect(expectedPath);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        user={user}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex-shrink-0 z-10 bg-white border-b">
          <DashboardNavbar
            user={user}
            onMenuClick={() => setMobileDrawerOpen(true)}
          />
        </header>

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 overflow-y-auto p-6 bg-gray-50"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
