"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../ui/drawer";
import { Menu, X } from "lucide-react";
import Logo from "@/assets/rf_logo.jpeg";
import { useAuth } from "@/context/AuthContext";

interface MobileMenuProps {
    scrollProgress: number;
    navLinks: readonly { name: string; href: string }[];
}

export const MobileMenu = ({ scrollProgress, navLinks }: MobileMenuProps) => {
    const { user, logout } = useAuth();

    const roleDashboards = {
        SYSTEM_ADMIN: "/admin",
        PROPERTY_MANAGER: "/property-manager",
        TENANT: "/tenant",
        VENDOR: "/vendor",
        AGENT: "/agent",
    };

    const dashboardPath = user
        ? roleDashboards[user.role as keyof typeof roleDashboards] || "/dashboard"
        : "/login";

    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-700 transition-all duration-200 hover:bg-slate-100 md:hidden"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </DrawerTrigger>

            <DrawerContent className="left-auto right-0 top-0 mt-0 h-full w-80 rounded-none border-l border-slate-200 bg-white">
                <DrawerHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <Image
                            src={Logo}
                            alt="RentFlow360"
                            width={32}
                            height={32}
                            className="object-contain mix-blend-multiply"
                        />
                        <DrawerTitle className="text-lg font-bold text-slate-900">
                            RentFlow360
                        </DrawerTitle>
                    </div>

                    <DrawerClose asChild>
                        <button type="button" className="rounded-lg p-2 hover:bg-slate-100">
                            <X className="h-5 w-5 text-slate-600" />
                        </button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-1">
                        {navLinks.map((link) => (
                            <DrawerClose asChild key={link.name}>
                                <Link
                                    href={link.href}
                                    className="block rounded-xl p-4 font-medium text-slate-700 transition-all duration-200 hover:bg-[#f0f7ff] hover:text-[#003b73] active:scale-[0.98]"
                                >
                                    {link.name}
                                </Link>
                            </DrawerClose>
                        ))}
                    </div>
                </div>

                <DrawerFooter className="border-t border-slate-200 p-6">
                    <div className="flex flex-col gap-3">
                        {!user ? (
                            <>
                                <DrawerClose asChild>
                                    <Link href="/login" className="w-full">
                                        <Button
                                            variant="outline"
                                            className="h-11 w-full rounded-full border-[#003b73] font-semibold text-[#003b73] hover:bg-[#f0f7ff]"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                </DrawerClose>

                                <DrawerClose asChild>
                                    <Link href="/signup" className="w-full">
                                        <Button className="h-11 w-full rounded-full bg-[#003b73] font-bold text-white shadow-sm hover:bg-[#002b5b]">
                                            Sign up
                                        </Button>
                                    </Link>
                                </DrawerClose>
                            </>
                        ) : (
                            <>
                                <DrawerClose asChild>
                                    <Link href={dashboardPath} className="w-full">
                                        <Button
                                            variant="outline"
                                            className="h-11 w-full rounded-full border-[#003b73] font-semibold text-[#003b73] hover:bg-[#f0f7ff]"
                                        >
                                            Dashboard
                                        </Button>
                                    </Link>
                                </DrawerClose>

                                <DrawerClose asChild>
                                    <Button
                                        type="button"
                                        onClick={logout}
                                        className="h-11 w-full rounded-full bg-[#003b73] font-bold text-white shadow-sm hover:bg-[#002b5b]"
                                    >
                                        Logout
                                    </Button>
                                </DrawerClose>
                            </>
                        )}
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};