import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Shield, Zap, TrendingUp, Building2, Users, CheckCircle } from "lucide-react";
import heroCityscape from "@/assets/hero-cityscape.jpg";

const HeroSection = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src={heroCityscape}
                    alt="Modern city skyline representing property management"
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                />

                {/* Enhanced Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-900/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-slate-900/40" />

                {/* Animated Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
                </div>

                {/* Floating Gradient Orbs - More Subtle */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float-medium delay-2000" />
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-500/8 to-emerald-500/8 rounded-full blur-3xl animate-float-slow delay-1000" />
            </div>

            {/* Content */}
            <div className="relative z-20 container mx-auto px-4 py-20 lg:py-32">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        {/* Left Column - Text Content */}
                        <div className="space-y-8 lg:space-y-10">
                            {/* Main Headline */}
                            <div className="space-y-6">
                                <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white leading-tight tracking-tight">
                                    Manage Your Properties{" "}
                                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                                        Like a Pro
                                    </span>
                                </h1>
                                <p className="font-inter text-xl text-white/80 leading-relaxed max-w-2xl">
                                    Transform how you manage properties with our all-in-one platform. Automate rent collection, streamline maintenance, and boost ROI with AI-powered insights trusted by industry leaders.
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
                                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group backdrop-blur-sm"
                                    >
                                        <div className="bg-blue-500/30 p-2 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                                            <item.icon className="w-4 h-4 text-blue-300 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div>
                                            <div className="font-inter font-semibold text-white text-sm">
                                                {item.text}
                                            </div>
                                            <div className="font-inter text-white/60 text-xs mt-1">
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
                                    className="font-inter text-lg px-8 py-6 bg-white/10 backdrop-blur-lg border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-300 group"
                                >
                                    <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Watch Demo
                                </Button>
                            </div>
                        </div>

                        {/* Right Column - Dashboard */}
                        <div className="relative">
                            {/* Main Dashboard Card */}
                            <div className="relative bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                                {/* Dashboard Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
                                        </div>
                                        <span className="font-inter text-white text-sm font-semibold">Live Dashboard</span>
                                    </div>
                                    <div className="text-white/70 text-xs bg-white/20 px-2 py-1 rounded-lg">Live</div>
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
                                            className="bg-white/10 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 cursor-pointer group backdrop-blur-sm"
                                        >
                                            <div className="text-white/70 text-xs font-inter mb-2">{stat.label}</div>
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
                                <div className="bg-white/10 rounded-2xl p-4 h-32 relative overflow-hidden backdrop-blur-sm">
                                    {/* Simulated Chart */}
                                    <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                                        {[30, 45, 60, 75, 90, 70, 85].map((height, index) => (
                                            <div
                                                key={index}
                                                className="w-6 bg-gradient-to-t from-blue-500/80 to-cyan-400/80 rounded-t-lg transition-all duration-500 hover:scale-y-110"
                                                style={{ height: `${height}%` }}
                                            />
                                        ))}
                                    </div>
                                    <div className="absolute bottom-2 left-4 text-white/50 text-xs font-inter">
                                        Revenue Growth
                                    </div>
                                </div>
                            </div>

                            {/* Floating Notification Cards */}
                            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 shadow-2xl animate-float-slow hover:scale-105 transition-transform duration-300 cursor-pointer group backdrop-blur-sm">
                                <div className="text-white font-bold text-sm">AI Insights</div>
                                <div className="text-white/90 text-xs">+15% ROI opportunity</div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
                            </div>

                            <div className="absolute -bottom-4 -left-4 bg-white/15 backdrop-blur-lg border border-white/30 rounded-2xl p-4 shadow-2xl animate-float-medium hover:scale-105 transition-transform duration-300 cursor-pointer group">
                                <div className="text-white font-bold text-xs">New Message</div>
                                <div className="text-white/70 text-xs">Tenant • 2 min ago</div>
                                <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;