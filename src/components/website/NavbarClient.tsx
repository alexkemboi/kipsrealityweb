"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/rf_logo.jpeg";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Remove Privacy Policy from the top navbar (retain link in footer)
  const filteredNavLinks = navLinks.filter((n) => n.name !== "Privacy Policy");

  // Base text color should always be dark because the landing page hero is light
  const textColor = "text-slate-700";
  const hoverColor = "hover:text-[#003b73]";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-white shadow-md py-2"
        : "bg-white py-4 border-b border-slate-100"
        }`}
    >
      <div className="site-container">
        <div className="flex items-center justify-between h-20 sm:h-24 transition-all duration-500">
          {/* Logo */}
          <Link href="/" className="flex items-center group cursor-pointer">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 transition-all duration-500 group-hover:scale-105">
              <Image
                src={Logo}
                alt="RentFlow360"
                fill
                className="object-contain mix-blend-multiply"
                priority
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {filteredNavLinks.map((link) => (
              <div
                key={link.id}
                className="relative group px-1"
                onMouseEnter={() => link.children?.length && setOpenSubmenu(link.id)}
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                {link.children && link.children.length > 0 ? (
                  <>
                    <button
                      className={`font-medium text-[15px] px-3 py-2 transition-all duration-300 flex items-center gap-1 group relative
                        ${pathname.startsWith(link.href) && link.href !== "/"
                          ? "text-[#003b73]"
                          : `${textColor} ${hoverColor}`
                        }
                        ${openSubmenu === link.id ? "text-[#003b73]" : ""}
                      `}
                    >
                      {link.name}
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openSubmenu === link.id ? 'rotate-180' : ''}`} />

                      {/* Submenu Trigger Underline */}
                      <span className={`absolute bottom-0 left-1 right-1 h-0.5 bg-[#003b73] transition-all duration-300 
                        ${(pathname.startsWith(link.href) && link.href !== "/") || openSubmenu === link.id ? "w-[calc(100%-8px)]" : "w-0 group-hover:w-[calc(100%-8px)]"}
                      `} />
                    </button>

                    {/* Submenu Dropdown */}
                    <div
                      className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 transition-all duration-200 transform origin-top-left ${openSubmenu === link.id
                        ? "opacity-100 visible translate-y-0 scale-100"
                        : "opacity-0 invisible -translate-y-2 scale-95"
                        }`}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-[#003b73] hover:text-white transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={`relative font-medium text-[15px] px-4 py-2 transition-all duration-300 block group
                      ${pathname === link.href
                        ? "text-[#003b73]"
                        : `${textColor} hover:text-[#003b73]`
                      }
                    `}
                  >
                    {link.name}
                    <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-[#003b73] transition-all duration-300
                      ${pathname === link.href ? "w-[calc(100%-32px)]" : "w-0 group-hover:w-[calc(100%-32px)]"}
                    `} />
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative transition-colors duration-300 ${textColor} ${hoverColor} hover:bg-[#f0f7ff]`}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </Button>

                <UserDropdown
                  user={user}
                  scrollProgress={isScrolled ? 1 : 0}
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
                    variant="outline"
                    className={`font-semibold text-[15px] px-5 h-10 rounded-full border-[#003b73] text-[#003b73] hover:bg-[#f0f7ff] hover:text-[#002b5b] transition-all duration-300`}
                  >
                    Login
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button
                    className="h-10 px-6 rounded-full text-[15px] font-bold text-white bg-[#003b73] hover:bg-[#002b5b] shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <MobileMenu
            user={user}
            scrollProgress={isScrolled ? 1 : 0}
            getDashboardPath={getDashboardPath}
            getUserInitials={getUserInitials}
            formatRoleName={formatRoleName}
            handleLogout={handleLogout}
            navLinks={filteredNavLinks}
          />
        </div>
      </div>
    </nav>
  );
};