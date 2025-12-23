"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/Logo.png";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { UserDropdown } from "./UserDropdown";
import { MobileMenu } from "./ MobileMenu";

interface NavbarItem {
  id: number;
  name: string;
  href: string;
  order: number;
  isVisible: boolean;
  isAvailable: boolean;
  parentId?: number | null;
  children?: NavbarItem[];
}

interface NavbarClientProps {
  navLinks: NavbarItem[];
}

export const NavbarClient = ({ navLinks }: NavbarClientProps) => {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  const { user, logout } = useAuth();
  const router = useRouter();

  // Mount guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll effect (safe – runs client only)
  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / 100, 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // prevent SSR/client mismatch
  if (!mounted) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    const roleDashboards = {
      SYSTEM_ADMIN: "/admin",
      PROPERTY_MANAGER: "/property-manager",
      TENANT: "/tenant",
      VENDOR: "/vendor",
    };
    return roleDashboards[user.role as keyof typeof roleDashboards] || "/dashboard";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  const formatRoleName = (role: string) =>
    role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const backgroundOpacity = 0.95 * scrollProgress;
  const backdropBlur = `blur(${8 * scrollProgress}px)`;
  const borderOpacity = 0.2 + 0.8 * scrollProgress;
  const textColor = scrollProgress > 0.1 ? "text-neutral-700" : "text-white";
  const hoverColor = scrollProgress > 0.1 ? "hover:text-blue-600" : "hover:text-white";
  const logoOpacity = Math.max(0.8, scrollProgress);
  const logoColor = scrollProgress > 0.1 ? "text-neutral-900" : "text-white";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: `rgba(255, 255, 255, ${backgroundOpacity})`,
        backdropFilter: backdropBlur,
        borderBottom: `1px solid rgba(0, 0, 0, ${borderOpacity})`,
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between transition-all duration-200 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src={Logo}
              alt="RentFlow360"
              width={40}
              height={40}
              className="object-contain transition-all duration-200 w-8 h-8"
            />
            <span
              className={`font-bold transition-all duration-200 text-xl ${logoColor}`}
              style={{
                opacity: logoOpacity,
                transform: `translateY(${(1 - scrollProgress) * -5}px)`,
              }}
            >
              RentFlow360
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div
                key={link.id}
                className="relative group"
                onMouseEnter={() => link.children?.length && setOpenSubmenu(link.id)}
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                {link.children && link.children.length > 0 ? (
                  <>
                    <button
                      className={`font-medium transition-all duration-200 flex items-center gap-1 ${textColor} ${hoverColor}`}
                      style={{
                        opacity: scrollProgress > 0.1 ? 1 : 0.9,
                      }}
                    >
                      {link.name}
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* Submenu Dropdown */}
                    <div
                      className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 transition-all duration-200 ${
                        openSubmenu === link.id
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                      }`}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={`font-medium transition-all duration-200 ${textColor} ${hoverColor}`}
                    style={{
                      opacity: scrollProgress > 0.1 ? 1 : 0.9,
                    }}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative transition-all duration-200 ${
                    scrollProgress > 0.1
                      ? "text-neutral-700 hover:text-blue-600 hover:bg-blue-50"
                      : "text-white hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>

                <UserDropdown
                  user={user}
                  scrollProgress={scrollProgress}
                  textColor={textColor}
                  hoverColor={hoverColor}
                  getDashboardPath={getDashboardPath}
                  getUserInitials={getUserInitials}
                  formatRoleName={formatRoleName}
                  handleLogout={handleLogout}
                />
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant={scrollProgress > 0.1 ? "ghost" : "outline"}
                    className={`font-inter transition-all duration-200 ${
                      scrollProgress > 0.1
                        ? "text-neutral-700 hover:text-blue-600 hover:bg-blue-50"
                        : "text-white border-white/30 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    Login
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button
                    className={`transition-all duration-200 ${
                      scrollProgress > 0.1
                        ? "bg-blue-500 text-white hover:opacity-90"
                        : "bg-white text-neutral-900 hover:bg-white/90"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <MobileMenu
            user={user}
            scrollProgress={scrollProgress}
            getDashboardPath={getDashboardPath}
            getUserInitials={getUserInitials}
            formatRoleName={formatRoleName}
            handleLogout={handleLogout}
            navLinks={navLinks}
          />
        </div>
      </div>
    </nav>
  );
};