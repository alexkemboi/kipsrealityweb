"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Mobile drawer state
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <DashboardContext.Provider
      value={{ isSidebarCollapsed, toggleSidebar, mobileDrawerOpen, setMobileDrawerOpen }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
