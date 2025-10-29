"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Building2, Menu, X } from "lucide-react";
import { DashboardSidebarLinks } from "./DashboardSidebarLinks";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext";

interface DashboardSidebarProps {
  user: {
    id: string;
    firstName: string;
    role: string;
    email: string;
    avatar?: string;
  };
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function DashboardSidebar({
  user,
  isCollapsed,
  toggleSidebar,
}: DashboardSidebarProps) {
  const { mobileDrawerOpen, setMobileDrawerOpen } = useDashboard();
  const open = !isCollapsed;

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div
      className={cn(
        "hidden md:flex flex-col bg-neutral-900 border-r border-neutral-800 transition-all duration-300 ease-in-out h-screen sticky top-0",
        open ? "w-64" : "w-20"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        {open && (
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-bold text-white text-lg">RentFlow360</h1>
              <p className="text-xs text-neutral-400 capitalize">
                {user.role.replace("-", " ")}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          <ChevronLeft
            className={cn("w-4 h-4 transition-transform", !open && "rotate-180")}
          />
        </button>
      </div>

      {/* Links */}
      <div className="flex-1 overflow-y-auto">
        <DashboardSidebarLinks user={user} open={open} isCollapsed={!open} />
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-800 p-4">
        {open ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName}
              </p>
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mx-auto">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Drawer
  const MobileDrawer = () => (
    <>
      {mobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-72 z-50 flex flex-col bg-neutral-950 border-r border-neutral-800 md:hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-lg">RentFlow360</h1>
                  <p className="text-xs text-neutral-400 capitalize">
                    {user.role.replace("-", " ")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <DashboardSidebarLinks user={user} open={true} isCollapsed={false} />
            </div>

            <div className="border-t border-neutral-800 p-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.firstName}</p>
                  <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileDrawer />
    </>
  );
}
