"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle, Zap, Home, Wrench, DollarSign, MessageSquare, BarChart } from "lucide-react"

const FeaturesSection = () => {
    const [activeFeature, setActiveFeature] = useState(0)

    const bridgeCards = [
        {
            title: "Automated Rent Collection",
            description: "Get paid faster with automated payment processing and real-time tracking",
            icon: DollarSign,
            stats: "95% faster payments",
            color: "from-blue-500 to-cyan-500",
            backgroundImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Modern payment concept
        },
        {
            title: "Maintenance Management",
            description: "Streamline repair requests and vendor coordination with smart workflows",
            icon: Wrench,
            stats: "67% faster resolution",
            color: "from-green-500 to-emerald-500",
            backgroundImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Maintenance worker
        },
        {
            title: "Tenant Communication",
            description: "Centralized messaging and announcement system for seamless coordination",
            icon: MessageSquare,
            stats: "99% satisfaction rate",
            color: "from-purple-500 to-pink-500",
            backgroundImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Modern communication
        }
    ]

    const features = [
        {
            id: "rent-automation",
            name: "Rent Automation",
            icon: Zap,
            description: "Streamline rent collection with intelligent automation",
            fullDescription: "Transform your rent collection process with our automated payment system. Schedule recurring payments, send automatic reminders, and track everything in real-time.",
            features: [
                "Schedule recurring rent reminders",
                "Accept ACH, credit, or debit payments securely",
                "Auto-generate payment receipts",
                "Late payment tracking & auto-penalties",
                "Multiple payment gateway integration",
                "Real-time payment status dashboard"
            ],
            stats: [
                { value: "95%", label: "Faster Collection" },
                { value: "3.2x", label: "More On-Time Payments" }
            ]
        },
        {
            id: "property-management",
            name: "Property Management",
            icon: Home,
            description: "Centralize all your properties and tenant data",
            fullDescription: "Manage your entire portfolio from a single dashboard. Track occupancy, handle leases, and monitor performance across all properties.",
            features: [
                "Central dashboard for all properties",
                "Digital lease uploads & e-signatures",
                "Tenant screening & verification integration",
                "Lease renewal alerts",
                "Occupancy rate tracking",
                "Document storage and management"
            ],
            stats: [
                { value: "27%", label: "Higher ROI" },
                { value: "99%", label: "Accuracy" }
            ]
        },
        {
            id: "maintenance",
            name: "Maintenance Management",
            icon: Wrench,
            description: "Streamline maintenance requests and vendor management",
            fullDescription: "Handle maintenance requests efficiently with our complete workflow management. From request to resolution, track every detail.",
            features: [
                "Tenants file requests with photos",
                "Managers assign technicians instantly",
                "Track costs and vendor performance",
                "Real-time resolution time tracking",
                "Push notifications for updates",
                "Preventive maintenance scheduling"
            ],
            stats: [
                { value: "67%", label: "Faster Resolution" },
                { value: "40%", label: "Cost Reduction" }
            ]
        },
        {
            id: "financial",
            name: "Financial Accounting",
            icon: DollarSign,
            description: "Complete financial management and reporting suite",
            fullDescription: "Get complete financial visibility with automated accounting, expense tracking, and comprehensive reporting.",
            features: [
                "Automated bank reconciliation",
                "Income & expense categorization",
                "Export data to QuickBooks / Excel",
                "Generate Profit & Loss statements",
                "Balance Sheet generation",
                "Cash Flow statement automation"
            ],
            stats: [
                { value: "8+", label: "Report Types" },
                { value: "100%", label: "Automated" }
            ]
        },
        {
            id: "communication",
            name: "CRM & Communication",
            icon: MessageSquare,
            description: "Seamless communication between all parties",
            fullDescription: "Keep everyone connected with our integrated communication platform. Message tenants, send announcements, and track conversations.",
            features: [
                "In-app messaging between tenants and landlords",
                "Broadcast announcements to all tenants",
                "Ticket-based communication for issues",
                "SMS and email notifications",
                "Communication history tracking",
                "Automated follow-up reminders"
            ],
            stats: [
                { value: "4.8/5", label: "Satisfaction" },
                { value: "2.5x", label: "Response Speed" }
            ]
        },
        {
            id: "analytics",
            name: "Analytics & Insights",
            icon: BarChart,
            description: "Data-driven insights for better decision making",
            fullDescription: "Make informed decisions with real-time analytics and predictive insights. Understand your portfolio performance at a glance.",
            features: [
                "Real-time performance metrics",
                "Vacancy rate analysis and forecasting",
                "Rent collection trends dashboard",
                "Predictive maintenance insights",
                "ROI calculation per property",
                "Market rate comparisons"
            ],
            stats: [
                { value: "15%", label: "Better Decisions" },
                { value: "Real-time", label: "Data Updates" }
            ]
        }
    ]

    return (
        <section id="features" className="relative">
            {/* Bridge Cards - Overlapping Section */}
            <div className="relative bg-white dark:bg-neutral-900 -mt-20 lg:-mt-20 z-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {bridgeCards.map((card) => (
                            <div key={card.title} className="relative group cursor-pointer h-50 overflow-hidden">
                                {/* Background Image Container */}
                                <div className="absolute inset-0">
                                    {/* Only the background image scales */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{
                                            backgroundImage: `url(${card.backgroundImage})`
                                        }}
                                    />
                                    {/* Dark Overlay */}
                                    <div className="absolute inset-0 bg-neutral-900/60 group-hover:bg-neutral-900/50 transition-all duration-500" />
                                </div>
                                <div className="relative h-full flex items-center p-6 text-white">
                                    <div className="space-y-3">
                                        <h3 className="font-poppins font-bold text-xl leading-tight">
                                            {card.title}
                                        </h3>
                                        <p className="font-inter text-white leading-relaxed">
                                            {card.description}
                                        </p>

                                        {/* Explore CTA */}
                                        <div className="flex items-center gap-2 pt-2 group/arrow">
                                            <span className="font-inter text-lg font-semibold text-white group-hover/arrow:text-white transition-colors">
                                                Explore Now
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-white/80 group-hover/arrow:text-white group-hover/arrow:translate-x-1 transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Features Section */}
            <div className="py-20 lg:py-32 bg-white dark:bg-neutral-900">
                <div className="container mx-auto px-4">

                    {/* Split Screen Features */}
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-5 gap-0">
                            {/* Left Column - Feature List */}
                            <div className="lg:col-span-2 relative">
                                <div className="space-y-1 p-4 lg:p-6">
                                    {features.map((feature, index) => (
                                        <button
                                            key={feature.id}
                                            onClick={() => setActiveFeature(index)}
                                            className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative ${activeFeature === index
                                                ? 'bg-neutral-100 dark:bg-neutral-800'
                                                : 'bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                                }`}
                                        >
                                            {/* Active Border Highlight */}
                                            {activeFeature === index && (
                                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 shadow-lg shadow-blue-500/30" />
                                            )}

                                            <div className="flex items-start gap-3 pr-2"> {/* Added padding to avoid text overlap */}
                                                <div className={`p-2 rounded-lg transition-all duration-300 ${activeFeature === index
                                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                                    }`}>
                                                    <feature.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-poppins font-semibold text-base mb-1 transition-all duration-300 ${activeFeature === index
                                                        ? 'text-neutral-900 dark:text-white'
                                                        : 'text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white'
                                                        }`}>
                                                        {feature.name}
                                                    </h3>
                                                    <p className={`font-inter text-xs transition-all duration-300 ${activeFeature === index
                                                            ? 'text-neutral-600 dark:text-neutral-400'
                                                            : 'text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-400'
                                                        }`}>
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column remains the same */}
                            <div className="lg:col-span-3 relative">
                                <div className="sticky top-8">
                                    <div className="bg-white dark:bg-neutral-800 p-6 lg:p-8 border-l border-neutral-200 dark:border-neutral-700">
                                        {/* Feature Header */}
                                        <div className="flex items-start gap-4 mb-8">
                                            <div className="flex-1">
                                                <h3 className="font-poppins font-bold text-2xl lg:text-3xl text-neutral-900 dark:text-white mb-3">
                                                    {features[activeFeature].name}
                                                </h3>
                                                <p className="font-inter text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed">
                                                    {features[activeFeature].fullDescription}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            {features[activeFeature].stats.map((stat, index) => (
                                                <div key={index} className="text-center p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                                                    <div className="font-poppins font-bold text-2xl text-neutral-900 dark:text-white mb-1">
                                                        {stat.value}
                                                    </div>
                                                    <div className="font-inter text-sm text-neutral-600 dark:text-neutral-300">
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Features List */}
                                        <div className="space-y-4 mb-8">
                                            <h4 className="font-poppins font-semibold text-xl text-neutral-900 dark:text-white mb-4">
                                                Key Features
                                            </h4>
                                            <div className="grid gap-3">
                                                {features[activeFeature].features.map((feature, index) => (
                                                    <div key={index} className="flex items-center gap-3 group">
                                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                        <span className="font-inter text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection