export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    readTime: number;
    date: string;
    image: string;
}

export const categories = [
    "All",
    "Property Management",
    "Legal Guides",
    "Software",
    "Accounting",
    "Marketing",
    "Maintenance",
    "Tenant Relations"
];

export const blogPosts: BlogPost[] = [
    {
        id: 1,
        title: "The Complete Guide to Property Management Software in 2025",
        excerpt: "Discover the top property management software solutions that can help you streamline operations, reduce costs, and scale your portfolio efficiently.",
        category: "Software",
        author: "Sarah Mitchell",
        readTime: 12,
        date: "2025-01-15",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop"
    },
    {
        id: 2,
        title: "Understanding Fair Housing Laws: What Every Landlord Needs to Know",
        excerpt: "Navigate the complexities of fair housing regulations and protect your rental business with this comprehensive legal guide.",
        category: "Legal Guides",
        author: "Michael Chen",
        readTime: 8,
        date: "2025-01-12",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop"
    },
    {
        id: 3,
        title: "Maximizing ROI: Advanced Rental Property Accounting Strategies",
        excerpt: "Learn proven accounting methods to optimize your cash flow, minimize tax liability, and maximize returns on your rental properties.",
        category: "Accounting",
        author: "Jennifer Lopez",
        readTime: 10,
        date: "2025-01-10",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop"
    },
    {
        id: 4,
        title: "Digital Marketing Tactics to Fill Vacancies Faster",
        excerpt: "Implement these cutting-edge digital marketing strategies to reduce vacancy rates and attract high-quality tenants consistently.",
        category: "Marketing",
        author: "David Park",
        readTime: 7,
        date: "2025-01-08",
        image: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&h=500&fit=crop"
    },
    {
        id: 5,
        title: "Preventive Maintenance Checklist for Rental Properties",
        excerpt: "Protect your investment and keep tenants happy with this comprehensive seasonal maintenance checklist for property managers.",
        category: "Maintenance",
        author: "Robert Taylor",
        readTime: 6,
        date: "2025-01-05",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=500&fit=crop"
    },
    {
        id: 6,
        title: "Building Strong Tenant Relationships: Communication Best Practices",
        excerpt: "Discover effective communication strategies that foster positive tenant relationships and reduce turnover rates.",
        category: "Tenant Relations",
        author: "Emily Rodriguez",
        readTime: 5,
        date: "2025-01-03",
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=500&fit=crop"
    },
    {
        id: 7,
        title: "Scaling Your Property Management Business: A Step-by-Step Guide",
        excerpt: "Learn the systems, processes, and strategies successful property managers use to scale from 10 to 100+ units.",
        category: "Property Management",
        author: "Alex Johnson",
        readTime: 15,
        date: "2024-12-28",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop"
    },
    {
        id: 8,
        title: "Security Deposit Laws by State: A Comprehensive Overview",
        excerpt: "Stay compliant with state-specific security deposit regulations and avoid costly legal disputes with this detailed guide.",
        category: "Legal Guides",
        author: "Maria Garcia",
        readTime: 11,
        date: "2024-12-25",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop"
    },
    {
        id: 9,
        title: "QuickBooks vs Specialized Property Management Accounting Software",
        excerpt: "Compare general accounting software with property-specific solutions to determine the best fit for your portfolio.",
        category: "Accounting",
        author: "Thomas Wright",
        readTime: 9,
        date: "2024-12-22",
        image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=500&fit=crop"
    }
];
