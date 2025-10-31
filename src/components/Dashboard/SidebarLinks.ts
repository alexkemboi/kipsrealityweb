
import { 
  LayoutDashboard,
  FileText,
  Image,
  Navigation,
  Settings,
  User,
  Home,
  ClipboardList,
  Bell,
  BarChart2,
  BarChart3,
  MessageSquare,
  DollarSign,
  Users,
  Wrench,
  Building2,
  Calculator,
  Zap
} from 'lucide-react'


// System routes (common for all roles)
export const systemRoutes = [
  { path: '/dashboard/profile', label: 'Profile', icon: User, badge: null },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings, badge: null },
]

// Role-based route configuration
export const routeConfig = {
  'SYSTEM_ADMIN': {
    main: [
      { path: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard, badge: null },
    ],
    content: [
      {
        path: '/admin/content/Hero-crud',
        label: 'Hero Section',
        icon: Zap,
        badge: null,
        description: 'Update background image and hero text'
      },
      {
        path: '/admin/content/AboutUs-crud',
        label: 'About Us Page',
        icon: Users,
        badge: null,
        description: 'Edit company story and team info'
      },
       {
        path: '/admin/content/ContactUs-crud',
        label: 'Contact Us Page',
        icon: Users,
        badge: null,
        description: 'View customer messages'
      },
      {
        path: '/admin/content/service-crud',
        label: 'Services Page',
        icon: Wrench,
        badge: null,
        description: 'Manage services list and descriptions'
      },
      {
        path: '/admin/content/policy-crud',
        label: 'Policy Page',
        icon: Wrench,
        badge: null,
        description: 'Manage policy sections and Content'
      },
      {
        path: '/admin/content/Pricing-Crud',
        label: 'Pricing Section',
        icon: DollarSign,
        badge: null,
        description: 'Update pricing plans and features'
      },
      {
        path: '/admin/content/CTA-crud',
        label: 'CTA Section',
        icon: DollarSign,
        badge: null,
        description: 'Update call-to-action content'
      },
      
      {
        path: '/admin/content/testimonial-crud',
        label: 'Testimonials',
        icon: MessageSquare,
        badge: null,
        description: 'Manage customer reviews and ratings'
      },
      {
        path: '/admin/content/navbar',
        label: 'Navbar',
        icon: MessageSquare,
        badge: null,
        description: 'Manage navigation links for the website'
      },
    ],
    blog: [
      {
        path: '/admin/content/blog',
        label: 'Blog Posts',
        icon: FileText,
        badge: null,
        description: 'Create and edit blog articles'
      },
      {
        path: '/admin/content/blog/categories',
        label: 'Blog Categories',
        icon: FileText,
        badge: null,
        description: 'Organize blog posts by categories'
      },
    ],
    media: [
      {
        path: '/admin/content/media',
        label: 'Media Library',
        icon: Image,
        badge: null,
        description: 'Upload and manage images'
      },
    ],
    navigation: [
      {
        path: '/admin/content/navigation',
        label: 'Site Navigation',
        icon: Navigation,
        badge: null,
        description: 'Manage menu items and links'
      },
    ],
    system: [
      { path: '/admin/users', label: 'User Management', icon: Users, badge: null },
      { path: '/admin/settings', label: 'System Settings', icon: Settings, badge: null },
    ]
  },


  'PROPERTY_MANAGER': {
    main: [
      { path: '/dashboard/property-manager', label: 'Dashboard Overview', icon: LayoutDashboard },
    ],
    properties: [
      { path: '/dashboard/property-manager/properties/register', label: 'Register Property', icon: Building2 },
      { path: '/dashboard/property-manager/properties/manage', label: 'Manage Units & Leases', icon: Building2 },
      { path: '/dashboard/property-manager/properties/vacancy', label: 'Vacancy Tracker', icon: Building2 },
    ],
    tenants: [
      { path: '/dashboard/property-manager/tenants/applications', label: 'Applications', icon: Users },
      { path: '/dashboard/property-manager/tenants/moves', label: 'Move-ins / Move-outs', icon: Users },
      { path: '/dashboard/property-manager/tenants/communication', label: 'Communication', icon: Users },
    ],
    maintenance: [
      { path: '/dashboard/property-manager/maintenance/requests', label: 'Requests', icon: Wrench },
      { path: '/dashboard/property-manager/maintenance/vendors', label: 'Assign Vendors', icon: Wrench },
      { path: '/dashboard/property-manager/maintenance/analytics', label: 'Analytics', icon: Wrench },
    ],
    accounting: [
      { path: '/dashboard/property-manager/accounting/invoicing', label: 'Rent Invoicing', icon: DollarSign },
      { path: '/dashboard/property-manager/accounting/late-fees', label: 'Late Fees', icon: DollarSign },
      { path: '/dashboard/property-manager/accounting/reconciliation', label: 'Reconciliation', icon: DollarSign },
    ],
    utilities: [
      { path: '/dashboard/property-manager/utilities/track', label: 'Track Usage', icon: BarChart3 },
      { path: '/dashboard/property-manager/utilities/allocate', label: 'Allocate Bills', icon: BarChart3 },
      { path: '/dashboard/property-manager/utilities/reports', label: 'Reports', icon: BarChart3 },
    ],
    analytics: [
      { path: '/dashboard/property-manager/analytics/revenue', label: 'Revenue Insights', icon: BarChart3 },
      { path: '/dashboard/property-manager/analytics/satisfaction', label: 'Tenant Satisfaction', icon: BarChart3 },
      { path: '/dashboard/property-manager/analytics/occupancy', label: 'Occupancy', icon: BarChart3 },
    ],
    settings: [
      { path: '/dashboard/property-manager/settings/integrations', label: 'Integrations', icon: Settings },
      { path: '/dashboard/property-manager/settings/notifications', label: 'Notifications', icon: Settings },
      { path: '/dashboard/property-manager/settings/roles', label: 'Role Management', icon: Settings },
    ],
  },

  TENANT: {
    main: [
      { path: '/dashboard/tenant', label: 'Overview', icon: LayoutDashboard },
    ],
    lease: [
      { path: '/dashboard/tenant/lease-details', label: 'View Lease Details', icon: Users },
      { path: '/dashboard/tenant/renew-terminate', label: 'Renew / Terminate Request', icon: Users },
      { path: '/dashboard/tenant/insurance-upload', label: 'Insurance Upload', icon: Users },
    ],
    payments: [
      { path: '/dashboard/tenant/pay-rent', label: 'Pay Rent (Stripe / Zelle / ACH)', icon: Calculator },
      { path: '/dashboard/tenant/payment-history', label: 'Payment History', icon: Calculator },
      { path: '/dashboard/tenant/upcoming-invoices', label: 'Upcoming Invoices', icon: Calculator },
    ],
    maintenance: [
      { path: '/dashboard/tenant/submit-request', label: 'Submit Request', icon: Wrench },
      { path: '/dashboard/tenant/track-progress', label: 'Track Progress', icon: Wrench },
      { path: '/dashboard/tenant/past-requests', label: 'View Past Requests', icon: Wrench },
    ],
    utilities: [
      { path: '/dashboard/tenant/usage-summary', label: 'Usage Summary', icon: Zap },
      { path: '/dashboard/tenant/shared-bills', label: 'Shared Utility Bills', icon: Zap },
      { path: '/dashboard/tenant/payment-breakdown', label: 'Payment Breakdown', icon: Zap },
    ],
    insurance: [
      { path: '/dashboard/tenant/insurance-purchase', label: 'Purchase / Upload Policy', icon: Users },
      { path: '/dashboard/tenant/insurance-renewal', label: 'Renewal Reminders', icon: Users },
      { path: '/dashboard/tenant/insurance-claims', label: 'Claim Assistance', icon: Users },
    ],
    notifications: [
      { path: '/dashboard/tenant/rent-reminders', label: 'Rent Reminders', icon: Zap },
      { path: '/dashboard/tenant/maintenance-notifications', label: 'Maintenance Updates', icon: Zap },
      { path: '/dashboard/tenant/lease-alerts', label: 'Lease Alerts', icon: Zap },
    ],
    profile: [
      { path: '/dashboard/tenant/update-info', label: 'Update Info', icon: Settings },
      { path: '/dashboard/tenant/security', label: 'MFA / Password Change', icon: Settings },
    ],
  },

  VENDOR: {
    main: [
      { path: '/dashboard/vendor', label: 'Overview', icon: Home, badge: null },
    ],
    workOrders: [
      { path: '/dashboard/vendor/jobs', label: 'My Jobs', icon: ClipboardList, badge: '4' },
      { path: '/dashboard/vendor/assigned', label: 'Assigned Requests', icon: FileText, badge: null },
      { path: '/dashboard/vendor/progress', label: 'Update Progress', icon: FileText, badge: null },
      { path: '/dashboard/vendor/reports', label: 'Submit Reports / Photos', icon: FileText, badge: null },
      { path: '/dashboard/vendor/status', label: 'Status Tracking', icon: FileText, badge: null },
      { path: '/dashboard/vendor/history', label: 'Maintenance History', icon: FileText, badge: null },
    ],
    invoices: [
      { path: '/dashboard/vendor/invoices', label: 'Invoices', icon: DollarSign, badge: '2' },
      { path: '/dashboard/vendor/generate', label: 'Generate Invoice', icon: FileText, badge: null },
      { path: '/dashboard/vendor/payment-history', label: 'Payment History', icon: FileText, badge: null },
      { path: '/dashboard/vendor/payment-updates', label: 'Payment Updates', icon: FileText, badge: null },
    ],
    analytics: [
      { path: '/dashboard/vendor/analytics', label: 'Analytics by Property', icon: BarChart2, badge: null },
    ],
    communication: [
      { path: '/dashboard/vendor/messages', label: 'Messages', icon: MessageSquare, badge: '1' },
      { path: '/dashboard/vendor/notifications', label: 'Notifications', icon: Bell, badge: null },
    ],
    profile: [
      { path: '/dashboard/vendor/profile', label: 'Business Info', icon: User, badge: null },
      { path: '/dashboard/vendor/certifications', label: 'Certifications & Documents', icon: User, badge: null },
      { path: '/dashboard/vendor/security', label: 'Security Settings', icon: User, badge: null },
    ]
  }
}
