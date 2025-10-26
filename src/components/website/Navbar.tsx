"use client"

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/Logo.png";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { UserDropdown } from "./UserDropdown";
import { MobileMenu } from "./ MobileMenu";

const Navbar = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const progress = Math.min(scrollY / 100, 1);
            setScrollProgress(progress);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const getDashboardPath = () => {
        if (!user) return '/login';
        const roleDashboards = {
            SYSTEM_ADMIN: '/admin',
            PROPERTY_MANAGER: '/property-manager',
            TENANT: '/tenant',
            VENDOR: '/vendor'
        };
        return roleDashboards[user.role as keyof typeof roleDashboards] || '/dashboard';
    };

    const getUserInitials = () => {
        if (!user) return 'U';
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
    };

    const formatRoleName = (role: string) => {
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const backgroundOpacity = 0.95 * scrollProgress;
    const backdropBlur = `blur(${8 * scrollProgress}px)`;
    const borderOpacity = 0.2 + (0.8 * scrollProgress);

    const textColor = scrollProgress > 0.1 ? "text-neutral-700" : "text-white";
    const hoverColor = scrollProgress > 0.1 ? "hover:text-blue-600" : "hover:text-white";

    const logoOpacity = Math.max(0.8, scrollProgress);
    const logoColor = scrollProgress > 0.1 ? "text-neutral-900" : "text-white";

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Services", href: "/services" },
        { name: "Pricing", href: "/plans" },
        { name: "About", href: "#about" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "#contact" },
        { name: "Marketplace", href: "/marketplace" },
    ];

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
            style={{
                background: `rgba(255, 255, 255, ${backgroundOpacity})`,
                backdropFilter: backdropBlur,
                borderBottom: `1px solid rgba(0, 0, 0, ${borderOpacity})`,
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
            }}
        >
            <div className="container mx-auto px-4">
                <div className={`flex items-center justify-between transition-all duration-200 h-14`}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <Image
                                src={Logo}
                                alt="RentFlow360"
                                width={40}
                                height={40}
                                className="object-contain transition-all duration-200 w-8 h-8"
                            />
                        </div>
                        <div>
                            <span
                                className={`font-bold transition-all duration-200 text-xl ${logoColor}`}
                                style={{
                                    opacity: logoOpacity,
                                    transform: `translateY(${(1 - scrollProgress) * -5}px)`
                                }}
                            >
                                RentFlow360
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`font-medium transition-all duration-200 ${textColor} ${hoverColor}`}
                                style={{
                                    opacity: scrollProgress > 0.1 ? 1 : 0.9
                                }}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* User Actions */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`relative transition-all duration-200 ${scrollProgress > 0.1
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
                            /* Login/Get Started for non-authenticated users */
                            <>
                                <Link href="/login">
                                    <Button
                                        variant={scrollProgress > 0.1 ? "ghost" : "outline"}
                                        className={`font-inter transition-all duration-200 ${scrollProgress > 0.1
                                            ? "text-neutral-700 hover:text-blue-600 hover:bg-blue-50"
                                            : "text-white border-white/30 hover:bg-white/20 hover:text-white"
                                            }`}
                                    >
                                        Login
                                    </Button>
                                </Link>

                                <Link href="/signup">
                                    <Button className={`transition-all duration-200 ${scrollProgress > 0.1
                                        ? "bg-blue-500 text-white hover:opacity-90"
                                        : "bg-white text-neutral-900 hover:bg-white/90"
                                        }`}>
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

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

export default Navbar;