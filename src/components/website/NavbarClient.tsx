"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "../ui/button";
import Logo from "@/assets/rf_logo.jpeg";
import { useAuth } from "@/context/AuthContext";
import { MobileMenu } from "./MobileMenu";

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

    handleScroll();
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
      AGENT: "/agent",
    };

    return (
      roleDashboards[user.role as keyof typeof roleDashboards] || "/dashboard"
    );
  };

  const filteredNavLinks = navLinks.filter(
    (n) => n.name !== "Privacy Policy" && n.isVisible && n.isAvailable
  );

  const textColor = "text-slate-700";
  const hoverColor = "hover:text-[#003b73]";

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white py-2 shadow-md"
          : "border-b border-slate-100 bg-white py-4"
      }`}
    >
      <div className="site-container">
        <div className="flex h-20 items-center justify-between transition-all duration-500 sm:h-24">
          <Link href="/" className="group flex items-center">
            <div className="relative h-20 w-20 transition-all duration-500 group-hover:scale-105 sm:h-24 sm:w-24">
              <Image
                src={Logo}
                alt="RentFlow360"
                fill
                className="object-contain mix-blend-multiply"
                priority
              />
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {filteredNavLinks.map((link) => (
              <div
                key={link.id}
                className="group relative px-1"
                onMouseEnter={() =>
                  link.children?.length ? setOpenSubmenu(link.id) : null
                }
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                {link.children && link.children.length > 0 ? (
                  <>
                    <button
                      type="button"
                      className={`relative flex items-center gap-1 px-3 py-2 text-[15px] font-medium transition-all duration-300 ${
                        pathname.startsWith(link.href) && link.href !== "/"
                          ? "text-[#003b73]"
                          : `${textColor} ${hoverColor}`
                      } ${openSubmenu === link.id ? "text-[#003b73]" : ""}`}
                    >
                      {link.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openSubmenu === link.id ? "rotate-180" : ""
                        }`}
                      />
                      <span
                        className={`absolute bottom-0 left-1 right-1 h-0.5 bg-[#003b73] transition-all duration-300 ${
                          (pathname.startsWith(link.href) && link.href !== "/") ||
                          openSubmenu === link.id
                            ? "w-[calc(100%-8px)]"
                            : "w-0 group-hover:w-[calc(100%-8px)]"
                        }`}
                      />
                    </button>

                    <div
                      className={`absolute left-0 top-full mt-2 w-56 origin-top-left rounded-xl border border-slate-100 bg-white py-2 shadow-lg transition-all duration-200 ${
                        openSubmenu === link.id
                          ? "visible translate-y-0 scale-100 opacity-100"
                          : "invisible -translate-y-2 scale-95 opacity-0"
                      }`}
                    >
                      {link.children
                        .filter((child) => child.isVisible && child.isAvailable)
                        .map((child) => (
                          <Link
                            key={child.id}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-[#003b73] hover:text-white"
                          >
                            {child.name}
                          </Link>
                        ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={`group relative block px-4 py-2 text-[15px] font-medium transition-all duration-300 ${
                      pathname === link.href
                        ? "text-[#003b73]"
                        : `${textColor} hover:text-[#003b73]`
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-0.5 bg-[#003b73] transition-all duration-300 ${
                        pathname === link.href
                          ? "w-[calc(100%-32px)]"
                          : "w-0 group-hover:w-[calc(100%-32px)]"
                      }`}
                    />
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            {!user ? (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="h-10 rounded-full border-[#003b73] px-5 text-[15px] font-semibold text-[#003b73] transition-all duration-300 hover:bg-[#f0f7ff] hover:text-[#002b5b]"
                  >
                    Login
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button className="h-10 rounded-full bg-[#003b73] px-6 text-[15px] font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#002b5b] hover:shadow-md">
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={getDashboardPath()}>
                  <Button
                    variant="outline"
                    className="h-10 rounded-full border-[#003b73] px-5 text-[15px] font-semibold text-[#003b73] transition-all duration-300 hover:bg-[#f0f7ff] hover:text-[#002b5b]"
                  >
                    Dashboard
                  </Button>
                </Link>

                <Button
                  onClick={handleLogout}
                  className="h-10 rounded-full bg-[#003b73] px-6 text-[15px] font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#002b5b] hover:shadow-md"
                >
                  Logout
                </Button>
              </>
            )}
          </div>

          <MobileMenu
            scrollProgress={isScrolled ? 1 : 0}
            navLinks={filteredNavLinks}
          />
        </div>
      </div>
    </nav>
  );
};