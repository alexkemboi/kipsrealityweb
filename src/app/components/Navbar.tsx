"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import {
    Drawer, DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "./ui/drawer";
import { Menu, X, Calendar } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/Logo.png";
import { ThemeToggle } from "./theme-toggle";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 20;
            setIsScrolled(scrolled);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "#home" },
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Integrations", href: "#integrations" },
        { name: "About", href: "#about" },
        { name: "Blog", href: "#blog" },
        { name: "Contact", href: "#contact" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${isScrolled
                ? "bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-lg border-b border-neutral-200 dark:border-neutral-800 py-2"
                : "bg-white/10 dark:bg-neutral-900/10 border-b border-white/10 dark:border-neutral-800/10 py-2"
                }`}
        >
            <div className="container mx-auto px-4">
                <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? "h-14" : "h-16"}`}>
                    {/* Logo */}
                    <Link href="#home" scroll={true} className="flex items-center space-x-3 group">
                        <div className="relative">
                            <Image
                                src={Logo}
                                alt="RentFlow360"
                                width={40}
                                height={40}
                                className={`object-contain transition-all duration-300 ${isScrolled ? "w-8 h-8" : "w-10 h-10"
                                    } group-hover:scale-105`}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-poppins font-bold transition-all duration-300 ${isScrolled ? "text-xl text-neutral-900 dark:text-white" : "text-2xl text-white dark:text-white"
                                }`}>
                                RentFlow360
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                scroll={true}
                                className={`font-inter font-medium transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 ${isScrolled
                                    ? "text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400"
                                    : "text-white/90 dark:text-white/90 hover:text-white dark:hover:text-white"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA Buttons */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            className={`font-inter transition-all duration-200 ${isScrolled
                                ? "text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                : "text-white dark:text-white hover:text-white dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/20"
                                }`}
                        >
                            Login
                        </Button>
                        <Button
                            className={`font-inter bg-gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 group ${isScrolled ? "px-6 py-2" : "px-8 py-3"
                                }`}
                        >
                            Start Free Trial
                            <Calendar className={`ml-2 group-hover:scale-110 transition-transform ${isScrolled ? "w-4 h-4" : "w-5 h-5"
                                }`} />
                        </Button>
                    </div>
                    {/* Mobile Menu Drawer Trigger */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <ThemeToggle />
                        <Drawer direction="right">
                            <DrawerTrigger asChild>
                                <button
                                    className={`lg:hidden p-2 rounded-lg transition-all duration-200 active:scale-95 ${isScrolled
                                        ? "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                        : "hover:bg-white/20 dark:hover:bg-white/20 text-white dark:text-white"
                                        }`}
                                >
                                    <Menu className="w-6 h-6 transition-transform duration-200" />
                                </button>
                            </DrawerTrigger>
                            <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-80 rounded-none bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800">
                                <div className="h-full flex flex-col">
                                    {/* Header */}
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
                                                <DrawerTitle className="font-poppins font-bold text-lg text-neutral-900">
                                                    RentFlow360
                                                </DrawerTitle>
                                            </div>
                                        </div>
                                        <DrawerClose asChild>
                                            <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 active:scale-95">
                                                <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                            </button>
                                        </DrawerClose>
                                    </DrawerHeader>

                                    {/* Navigation Links */}
                                    <div className="flex-1 overflow-y-auto px-6 py-4">
                                        <div className="space-y-1">
                                            {navLinks.map((link) => (
                                                <DrawerClose asChild key={link.name}>
                                                    <Link
                                                        href={link.href}
                                                        scroll={true}
                                                        className="block p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 active:scale-[0.98] text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 font-inter font-medium"
                                                    >
                                                        {link.name}
                                                    </Link>
                                                </DrawerClose>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer with CTA Buttons */}
                                    <DrawerFooter className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-6 space-y-3">
                                        <DrawerClose asChild>
                                            <Button className="w-full font-inter bg-gradient-primary text-white shadow-lg transition-all duration-200 active:scale-[0.98] group">
                                                <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                                Start Free Trial
                                            </Button>
                                        </DrawerClose>
                                        <DrawerClose asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full font-inter border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 active:scale-[0.98]"
                                            >
                                                Login
                                            </Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;