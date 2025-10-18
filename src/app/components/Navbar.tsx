"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Phone, Calendar, ArrowRight, Home, Zap, DollarSign, BookOpen } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/Logo.png";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [menuAnimation, setMenuAnimation] = useState('closed');

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 10;
            setIsScrolled(scrolled);

            if (scrolled) {
                const winHeight = window.innerHeight;
                const docHeight = document.documentElement.scrollHeight;
                const scrollTop = window.scrollY;
                const progress = scrollTop / (docHeight - winHeight);
                setScrollProgress(progress);
            } else {
                setScrollProgress(0);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            setMenuAnimation('opening');
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
            const timer = setTimeout(() => setMenuAnimation('open'), 50);
            return () => clearTimeout(timer);
        } else {
            setMenuAnimation('closing');
            document.body.style.overflow = 'unset';
            const timer = setTimeout(() => setMenuAnimation('closed'), 300);
            return () => clearTimeout(timer);
        }
    }, [isMobileMenuOpen]);

    const navLinks = [
        {
            name: "Solutions",
            href: "#solutions",
            icon: Zap,
            dropdown: [
                { label: "Property Managers", description: "Scale your portfolio efficiently" },
                { label: "Real Estate Investors", description: "Maximize ROI across properties" },
                { label: "Landlords", description: "Simplify rental management" }
            ]
        },
        { name: "Features", href: "#features", icon: Home },
        { name: "Pricing", href: "#pricing", icon: DollarSign },
        { name: "Resources", href: "#resources", icon: BookOpen },
    ];

    const closeMenu = () => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
                    : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <a href="#home" className="flex items-center space-x-3 group" onClick={closeMenu}>
                        <div className="relative">
                            <Image
                                src={Logo}
                                alt="RentFlow360"
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-poppins font-bold text-xl lg:text-2xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                RentFlow360
                            </span>
                            <span className="text-xs text-gray-500 font-inter -mt-1 hidden sm:block">
                                Professional
                            </span>
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <div
                                key={link.name}
                                className="relative"
                                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <a
                                    href={link.href}
                                    className="flex items-center space-x-1 px-4 py-2 font-inter text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors group"
                                >
                                    <span>{link.name}</span>
                                    {link.dropdown && (
                                        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                                    )}
                                </a>

                                {/* Dropdown Menu */}
                                {link.dropdown && activeDropdown === link.name && (
                                    <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-4 transition-all duration-300 animate-in fade-in-0 zoom-in-95">
                                        <div className="space-y-2">
                                            {link.dropdown.map((item, index) => (
                                                <a
                                                    key={index}
                                                    href="#"
                                                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-all group"
                                                >
                                                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                        <div className="w-4 h-4 bg-blue-600 rounded-sm" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-inter font-semibold text-slate-800 text-sm">
                                                            {item.label}
                                                        </div>
                                                        <div className="font-inter text-slate-500 text-xs">
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            className="font-inter text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                            Login
                        </Button>
                        <Button className="font-inter bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                            Start Free Trial
                            <Calendar className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-slate-700 transition-transform duration-200" />
                        ) : (
                            <Menu className="w-6 h-6 text-slate-700 transition-transform duration-200" />
                        )}
                    </button>
                </div>

                {/* Premium Mobile Menu */}
                {(menuAnimation === 'opening' || menuAnimation === 'open' || menuAnimation === 'closing') && (
                    <>
                        {/* Backdrop Overlay */}
                        <div
                            className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${menuAnimation === 'open'
                                    ? 'bg-black/30 backdrop-blur-sm'
                                    : menuAnimation === 'opening'
                                        ? 'bg-black/0 backdrop-blur-0 animate-in fade-in-0 duration-300'
                                        : 'bg-black/0 backdrop-blur-0 animate-out fade-out-0 duration-300'
                                }`}
                            onClick={closeMenu}
                        />

                        {/* Menu Panel */}
                        <div
                            className={`lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-full bg-white z-50 shadow-2xl border-l border-gray-100 transition-transform duration-300 ease-out ${menuAnimation === 'open'
                                    ? 'translate-x-0'
                                    : menuAnimation === 'opening'
                                        ? 'translate-x-full animate-in slide-in-from-right-full duration-300'
                                        : 'translate-x-full animate-out slide-out-to-right-full duration-300'
                                }`}
                        >
                            {/* Header with Close Button */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src={Logo}
                                        alt="RentFlow360"
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 object-contain"
                                    />
                                    <div>
                                        <h3 className="font-poppins font-bold text-lg text-slate-800">
                                            RentFlow360
                                        </h3>
                                        <p className="font-inter text-xs text-slate-500">
                                            Menu
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeMenu}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
                                >
                                    <X className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>

                            {/* Navigation Links - Scrollable Area */}
                            <div className="h-[calc(100vh-200px)] overflow-y-auto">
                                <div className="p-6 space-y-2">
                                    {navLinks.map((link) => (
                                        <div key={link.name} className="group">
                                            <a
                                                href={link.href}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 active:scale-[0.98]"
                                                onClick={closeMenu}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                        <link.icon className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-inter font-semibold text-slate-800">
                                                        {link.name}
                                                    </span>
                                                </div>
                                                {link.dropdown && (
                                                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                                                )}
                                            </a>

                                            {/* Mobile Dropdown */}
                                            {link.dropdown && (
                                                <div className="ml-12 mt-1 space-y-2">
                                                    {link.dropdown.map((item, index) => (
                                                        <a
                                                            key={index}
                                                            href="#"
                                                            className="block p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
                                                            onClick={closeMenu}
                                                        >
                                                            <div className="font-inter font-medium text-slate-700 text-sm">
                                                                {item.label}
                                                            </div>
                                                            <div className="font-inter text-slate-500 text-xs mt-1">
                                                                {item.description}
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fixed CTA Section */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 p-6 border-t border-gray-100">
                                <div className="space-y-3">
                                    <Button
                                        className="w-full font-inter bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg transition-all duration-200 active:scale-[0.98] group"
                                        onClick={closeMenu}
                                    >
                                        <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                        Start Free Trial
                                    </Button>

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 font-inter border-gray-300 text-slate-700 hover:bg-gray-50 transition-all duration-200 active:scale-[0.98] text-sm"
                                            onClick={closeMenu}
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 font-inter border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-200 active:scale-[0.98] text-sm"
                                            onClick={closeMenu}
                                        >
                                            <Phone className="w-3 h-3 mr-1" />
                                            Contact
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Progress Bar */}
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-transform duration-300"
                style={{
                    transform: `scaleX(${scrollProgress})`
                }}
            />
        </nav>
    );
};

export default Navbar;