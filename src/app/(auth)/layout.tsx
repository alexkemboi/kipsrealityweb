import { ReactNode } from "react";
import Image from 'next/image';
import heroCityscape from "@/assets/hero-cityscape.jpg";

interface AuthLayoutProps {
    children: ReactNode;
    mode?: 'login' | 'register';
}

export default function AuthLayout({ children, mode = 'login' }: AuthLayoutProps) {
    const headline = mode === 'login'
        ? "Welcome to RentFlow360"
        : "Join RentFlow360 Today";

    const subheading = "Start streamlining your property management Today!"


    return (
        <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
            {/* Background Image with Lighter Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/bg-image.jpeg"
                    alt="Modern city skyline"
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Left Side - Branding & Info */}
            <div className="w-full md:w-1/2 relative z-10 overflow-hidden flex">
                <div className="relative z-20 flex flex-col justify-center px-8 md:px-16 text-white">
                    {/* Dynamic Headline based on mode */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {headline}
                    </h1>
                    <div className="w-16 h-1 bg-[#003b73] mb-6 rounded-full" />

                    {/* Dynamic Subheading */}
                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-md leading-relaxed">
                        {subheading}
                    </p>

                    {/* Feature Points */}
                    <div className="space-y-4">
                        {[
                            "Manage unlimited properties and tenants",
                            "Automate rent collection and maintenance",
                            "Track financial performance in real-time",
                            "24/7 support and AI-powered insights"
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3 group">
                                <div className="w-2 h-2 bg-[#003b73] rounded-full group-hover:scale-125 transition-transform duration-300" />
                                <span className="text-white/90 group-hover:text-white transition-colors duration-300">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full md:w-1/2 relative z-10 flex items-center justify-center p-8">
                <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-neutral-100">
                    {children}
                </div>
            </div>
        </div>
    );
}