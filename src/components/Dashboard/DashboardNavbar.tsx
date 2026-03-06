"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";

export function DashboardNavbar({ toggleSidebar: toggleSidebarProp, user: userProp }: { toggleSidebar?: () => void; user?: {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  email?: string;
  avatar?: string;
} | null }) {
  const { user: authUser, logout } = useAuth();
  
  // Proper null handling - prefer userProp but fall back to authUser only if needed
  // If neither is available, show loading state
  const user = userProp ?? authUser;
  
  const { setMobileDrawerOpen } = useDashboard();
  const toggleSidebar = toggleSidebarProp ?? (() => setMobileDrawerOpen(true));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const settingsBasePath = (() => {
    const role = user?.role;
    switch (role) {
      case "SYSTEM_ADMIN":
        return "/admin/settings";
      case "PROPERTY_MANAGER":
        return "/property-manager/settings";
      case "TENANT":
        return "/tenant/settings";
      case "VENDOR":
        return "/vendor/settings";
      case "AGENT":
        return "/agent/settings";
      default:
        return "/login";
    }
  })();

  // ✅ FIX: Logout Logic
  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout failed", error);
      // Fallback hard redirect if context logout fails unexpectedly.
      window.location.href = "/login";
    }
  };

  // Get Initials for Avatar
  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 transition-all duration-300">
      <div className="h-full px-6 flex items-center justify-between">

        {/* Left: Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md text-gray-600"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search properties, tenants, invoices..."
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getInitials()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user?.role?.replace("_", " ") || "User"}
                </p>
              </div>
              <ChevronDown size={16} className="text-gray-400 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">

                {/* Mobile User Info (Only shows on mobile inside dropdown) */}
                <div className="md:hidden px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href={`${settingsBasePath}/profile`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <Link
                    href={settingsBasePath}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}