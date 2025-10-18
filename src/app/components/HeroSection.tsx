import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Star, Shield, Zap, TrendingUp, Building2, Users, CheckCircle } from "lucide-react";

const HeroSection = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Premium Background */}
            <div className="absolute inset-0 z-0">
                {/* Animated Grid */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
                </div>

                {/* Floating Gradient Orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl animate-float-medium delay-2000" />
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-float-slow delay-1000" />

                {/* Animated Lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse" />
            </div>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-4 py-20 lg:py-32">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        {/* Left Column - Text Content */}
                        <div className="space-y-8 lg:space-y-10">
                            {/* Trust Badge with Animation */}
                            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-5 py-3 animate-fade-in-up hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform" />
                                    ))}
                                </div>
                                <span className="font-inter text-sm text-white/80 font-medium">
                                    Rated 4.9/5 by 2,500+ property managers
                                </span>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                            </div>

                            {/* Main Headline */}
                            <div className="space-y-6">
                                <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white leading-tight tracking-tight">
                                    Property Management{" "}
                                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                                        Reimagined
                                    </span>
                                </h1>
                                <p className="font-inter text-xl text-white/70 leading-relaxed max-w-2xl">
                                    The all-in-one platform that transforms how you manage properties. Automate rent collection, streamline maintenance, and boost ROI with AI-powered insights trusted by industry leaders.
                                </p>
                            </div>

                            {/* Feature Points */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl">
                                {[
                                    { icon: Zap, text: "90% Faster Rent Collection", subtext: "Automated payments" },
                                    { icon: Shield, text: "Bank-Level Security", subtext: "SOC 2 Certified" },
                                    { icon: TrendingUp, text: "27% Higher ROI", subtext: "Average increase" },
                                    { icon: Building2, text: "Unlimited Properties", subtext: "Scale effortlessly" },
                                    { icon: Users, text: "Happy Tenants", subtext: "4.8/5 satisfaction" },
                                    { icon: CheckCircle, text: "24/7 Support", subtext: "Always available" }
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group cursor-pointer"
                                    >
                                        <div className="bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                            <item.icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <div className="font-inter font-semibold text-white text-sm">
                                                {item.text}
                                            </div>
                                            <div className="font-inter text-white/50 text-xs mt-1">
                                                {item.subtext}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Button
                                    size="lg"
                                    className="font-inter text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <span className="relative">Start Free Trial</span>
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="font-inter text-lg px-8 py-6 bg-white/5 backdrop-blur-lg border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300 group"
                                >
                                    <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Watch Demo
                                </Button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="pt-6">
                                <p className="font-inter text-sm text-white/60 mb-4">Trusted by leading companies worldwide</p>
                                <div className="flex items-center gap-8 opacity-80 flex-wrap">
                                    {["REMAX", "CBRE", "JLL", "Colliers", "Keller Williams", "Sotheby's"].map((company, index) => (
                                        <div
                                            key={index}
                                            className="text-white/60 font-semibold text-lg hover:text-white/80 transition-colors duration-300 cursor-pointer"
                                        >
                                            {company}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Premium Dashboard */}
                        <div className="relative">
                            {/* Main Dashboard Card */}
                            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                                {/* Dashboard Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
                                        </div>
                                        <span className="font-inter text-white text-sm font-semibold">Live Dashboard</span>
                                    </div>
                                    <div className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded-lg">Live</div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {[
                                        { label: "Monthly Revenue", value: "$124,580", trend: "+12%", color: "text-green-400" },
                                        { label: "Occupancy Rate", value: "98.2%", trend: "+2.1%", color: "text-green-400" },
                                        { label: "Maintenance", value: "3 Active", trend: "-67%", color: "text-blue-400" },
                                        { label: "Satisfaction", value: "4.8/5", trend: "+0.3", color: "text-yellow-400" }
                                    ].map((stat, index) => (
                                        <div
                                            key={index}
                                            className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                                        >
                                            <div className="text-white/60 text-xs font-inter mb-2">{stat.label}</div>
                                            <div className="text-white font-bold text-lg mb-1 group-hover:scale-105 transition-transform">
                                                {stat.value}
                                            </div>
                                            <div className={`text-xs font-inter ${stat.color}`}>
                                                {stat.trend}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart Visualization */}
                                <div className="bg-white/5 rounded-2xl p-4 h-32 relative overflow-hidden">
                                    {/* Simulated Chart */}
                                    <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                                        {[30, 45, 60, 75, 90, 70, 85].map((height, index) => (
                                            <div
                                                key={index}
                                                className="w-6 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:scale-y-110"
                                                style={{ height: `${height}%` }}
                                            />
                                        ))}
                                    </div>
                                    <div className="absolute bottom-2 left-4 text-white/40 text-xs font-inter">
                                        Revenue Growth
                                    </div>
                                </div>
                            </div>

                            {/* Floating Notification Cards */}
                            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-2xl animate-float-slow hover:scale-105 transition-transform duration-300 cursor-pointer group">
                                <div className="text-white font-bold text-sm">AI Insights</div>
                                <div className="text-white/90 text-xs">+15% ROI opportunity</div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
                            </div>

                            <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-2xl animate-float-medium hover:scale-105 transition-transform duration-300 cursor-pointer group">
                                <div className="text-white font-bold text-xs">New Message</div>
                                <div className="text-white/60 text-xs">Tenant • 2 min ago</div>
                                <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                <div className="animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center backdrop-blur-sm">
                        <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;