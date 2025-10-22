"use client"

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
    Drawer, DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../ui/drawer";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/Logo.png";
import Link from "next/link";

const Navbar = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const progress = Math.min(scrollY / 100, 1);
            setScrollProgress(progress);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
<<<<<<< Updated upstream
        { name: "Pricing", href: "/plans" },
=======
        { name: "Pricing", href: "#pricing" },
        { name: "Integrations", href: "#integrations" },
>>>>>>> Stashed changes
        { name: "About", href: "#about" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "#contact" },
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

<<<<<<< Updated upstream
                    <div className="hidden lg:flex items-center space-x-4">
                        <Link href="/login">
                            <Button
                                variant={scrollProgress > 0.1 ? "ghost" : "outline"}
                                className={`font-inter transition-all duration-200 ${scrollProgress > 0.1
                                    ? "text-neutral-700 hover:text-blue-600 hover:bg-blue-50"
                                    : "text-white border-white/30 hover:bg-white/20 hover:text-white"
=======
                    {/* Desktop CTA Buttons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {/* Login Button */}
                        <Link href="/login">
                            <Button
                                variant="ghost"
                                className={`font-inter transition-all duration-200 ${isScrolled
                                        ? "text-neutral-700 hover:text-blue-600 hover:bg-blue-50"
                                        : "text-white hover:text-white hover:bg-white/20"
                                    }`}
                            >
                                Login
                            </Button>
                        </Link>

                        {/* Signup Button */}
                        <Link href="/signup">
                            <Button
                                className={`font-inter bg-gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 group ${isScrolled ? "px-6 py-2" : "px-8 py-3"
                                    }`}
                            >
                                Start Free Trial
                                <Calendar
                                    className={`ml-2 group-hover:scale-110 transition-transform ${isScrolled ? "w-4 h-4" : "w-5 h-5"
                                        }`}
                                />
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Drawer Trigger */}
                    <Drawer direction="right">
                        <DrawerTrigger asChild>
                            <button
                                className={`lg:hidden p-2 rounded-lg transition-all duration-200 active:scale-95 ${isScrolled
                                    ? "hover:bg-neutral-100 text-neutral-700"
                                    : "hover:bg-white/20 text-white"
>>>>>>> Stashed changes
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
                    </div>

                    <Drawer direction="right">
                        <DrawerTrigger asChild>
                            <Button variant="ghost" size="icon" className={`lg:hidden transition-all duration-200 ${scrollProgress > 0.1 ? "text-neutral-700 hover:bg-neutral-200" : "text-white hover:bg-white/20"}`}>
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
                            </div>
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
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;