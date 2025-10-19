import { Zap, Home, Wrench, DollarSign, MessageSquare, BarChart } from "lucide-react"


export const bridgeCards = [
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

export const features = [
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