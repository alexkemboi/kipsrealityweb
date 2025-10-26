import { Button } from "../ui/button";
import {
    Drawer, DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../ui/drawer";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/Logo.png";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface MobileMenuProps {
    user: any;
    scrollProgress: number;
    getDashboardPath: () => string;
    getUserInitials: () => string;
    formatRoleName: (role: string) => string;
    handleLogout: () => void;
    navLinks: readonly { name: string; href: string; }[];
}

export const MobileMenu = ({
    user,
    scrollProgress,
    getDashboardPath,
    getUserInitials,
    formatRoleName,
    handleLogout,
    navLinks
}: MobileMenuProps) => {
    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`lg:hidden transition-all duration-200 ${scrollProgress > 0.1
                            ? "text-neutral-700 hover:bg-neutral-200"
                            : "text-white hover:bg-white/20"
                        }`}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full top-0 right-0 left-auto mt-0 w-80 rounded-none bg-white border-l border-neutral-200">
                <DrawerHeader className="flex flex-row items-center justify-between border-b border-neutral-200 px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <Image
                            src={Logo}
                            alt="RentFlow360"
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                        />
                        <div>
                            <DrawerTitle className="font-bold text-lg text-neutral-900">
                                RentFlow360
                            </DrawerTitle>
                        </div>
                    </div>
                    <DrawerClose asChild>
                        <button className="p-2 rounded-lg hover:bg-neutral-100">
                            <X className="w-5 h-5 text-neutral-600" />
                        </button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {user ? (
                        <AuthenticatedMobileContent
                            user={user}
                            getDashboardPath={getDashboardPath}
                            getUserInitials={getUserInitials}
                            formatRoleName={formatRoleName}
                            handleLogout={handleLogout}
                            navLinks={navLinks}
                        />
                    ) : (
                        <UnauthenticatedMobileContent navLinks={navLinks} />
                    )}
                </div>

                {!user && (
                    <MobileAuthButtons />
                )}
            </DrawerContent>
        </Drawer>
    );
};

// Sub-component for authenticated user mobile content
const AuthenticatedMobileContent = ({
    user,
    getDashboardPath,
    getUserInitials,
    formatRoleName,
    handleLogout,
    navLinks
}: {
    user: any;
    getDashboardPath: () => string;
    getUserInitials: () => string;
    formatRoleName: (role: string) => string;
    handleLogout: () => void;
    navLinks: readonly { name: string; href: string; }[];
}) => (
    <div className="space-y-6">
        {/* User Info Section */}
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
            <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-blue-500 text-white">
                    {getUserInitials()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="font-semibold text-neutral-900">
                    {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-neutral-600">{user.email}</div>
                <Badge
                    variant="outline"
                    className={`mt-1 text-xs bg-blue-100 text-blue-800 border-blue-200`}
                >
                    {formatRoleName(user.role)}
                </Badge>
            </div>
        </div>

        {/* User Actions */}
        <div className="space-y-1">
            <DrawerClose asChild>
                <Link
                    href={getDashboardPath()}
                    className="flex items-center space-x-3 p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 active:scale-[0.98] text-neutral-700 hover:text-blue-600 font-inter font-medium"
                >
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>
            </DrawerClose>

            <DrawerClose asChild>
                <Link
                    href="/dashboard/settings"
                    className="flex items-center space-x-3 p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 active:scale-[0.98] text-neutral-700 hover:text-blue-600 font-inter font-medium"
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>
            </DrawerClose>

            <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-4 rounded-xl hover:bg-red-50 transition-all duration-200 active:scale-[0.98] text-red-600 hover:text-red-700 font-inter font-medium w-full text-left"
            >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
            </button>
        </div>

        <NavigationSection navLinks={navLinks} />
    </div>
);

// Sub-component for unauthenticated user mobile content
const UnauthenticatedMobileContent = ({
    navLinks
}: {
    navLinks: readonly { name: string; href: string; }[]
}) => (
    <div className="space-y-1">
        {navLinks.map((link) => (
            <DrawerClose asChild key={link.name}>
                <Link
                    href={link.href}
                    className="block p-4 rounded-xl hover:bg-blue-50 transition-all duration-200 active:scale-[0.98] text-neutral-700 hover:text-blue-600 font-inter font-medium"
                >
                    {link.name}
                </Link>
            </DrawerClose>
        ))}
    </div>
);

// Sub-component for navigation links section
const NavigationSection = ({
    navLinks
}: {
    navLinks: readonly { name: string; href: string; }[]
}) => (
    <div className="border-t pt-4">
        <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Navigation
        </div>
        {navLinks.map((link) => (
            <DrawerClose asChild key={link.name}>
                <Link
                    href={link.href}
                    className="block p-3 rounded-xl hover:bg-neutral-50 transition-all duration-200 text-neutral-700 hover:text-blue-600 font-inter"
                >
                    {link.name}
                </Link>
            </DrawerClose>
        ))}
    </div>
);

// Sub-component for mobile auth buttons
const MobileAuthButtons = () => (
    <DrawerFooter className="flex flex-row gap-2">
        <DrawerClose asChild>
            <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                    Login
                </Button>
            </Link>
        </DrawerClose>
        <DrawerClose asChild>
            <Link href="/signup" className="flex-1">
                <Button className="w-full bg-blue-500 text-white">
                    Get Started
                </Button>
            </Link>
        </DrawerClose>
    </DrawerFooter>
);