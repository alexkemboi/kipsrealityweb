'use client'

import {
  LayoutDashboard,
  Inbox,
  FileText,
  Building2,
  Users,
  Wrench,
  Calculator,
  Zap,
  Settings,
} from 'lucide-react'

// import { filterLinks } from '@/lib/filters'

const filterLinks = {
  approvals: '/property-manager/approvals',
  vacantUnits: '/property-manager/vacant-units',
  expiringLeases: '/property-manager/expiring-leases',
  openMaintenance: '/property-manager/maintenance',
  overdueInvoices: '/property-manager/overdue-invoices',
}

export type SidebarRoute = {
  label: string
  href: string
  icon?: any
  children?: SidebarRoute[]
}

export type RouteGroups = {
  main?: SidebarRoute[]
  operate?: SidebarRoute[]
  finance?: SidebarRoute[]
  utilities?: SidebarRoute[]
  settings?: SidebarRoute[]
  [key: string]: SidebarRoute[] | undefined
}

export const systemRoutes: SidebarRoute[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
]

export const routeConfig: Record<string, RouteGroups> = {
  PROPERTY_MANAGER: {
    main: [
      { label: 'Dashboard', href: '/property-manager', icon: LayoutDashboard },
      // Approvals queue (pending leases)
      { label: 'Inbox', href: filterLinks.approvals, icon: Inbox },
    ],

    operate: [
      { label: 'Properties', href: '/property-manager/view-property', icon: Building2 },
      { label: 'Tenants', href: '/property-manager/tenants', icon: Users },

      // Filtered views
      { label: 'Vacant Units', href: filterLinks.vacantUnits, icon: Building2 },
      { label: 'Expiring Leases', href: filterLinks.expiringLeases, icon: FileText },
      { label: 'Maintenance Requests', href: filterLinks.openMaintenance, icon: Wrench },
    ],

    finance: [
      { label: 'Finance', href: '/property-manager/finance', icon: Calculator },
      { label: 'Overdue Invoices', href: filterLinks.overdueInvoices, icon: FileText },
    ],

    utilities: [{ label: 'Utilities', href: '/property-manager/utilities', icon: Zap }],

    settings: [{ label: 'Settings', href: '/property-manager/settings', icon: Settings }],
  },

  SYSTEM_ADMIN: {
    main: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
    settings: [{ label: 'Settings', href: '/settings', icon: Settings }],
  },

  TENANT: {
    main: [{ label: 'Dashboard', href: '/tenant', icon: LayoutDashboard }],
    settings: [{ label: 'Settings', href: '/tenant/settings', icon: Settings }],
  },

  AGENT: {
    main: [{ label: 'Dashboard', href: '/agent', icon: LayoutDashboard }],
    settings: [{ label: 'Settings', href: '/agent/settings', icon: Settings }],
  },

  VENDOR: {
    main: [{ label: 'Dashboard', href: '/vendor', icon: LayoutDashboard }],
    settings: [{ label: 'Settings', href: '/vendor/settings', icon: Settings }],
  },

  ALL: {
    main: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DashboardSidebarLinksProps {
  user: {
    role: string;
    [key: string]: any;
  };
  open: boolean;
  isCollapsed: boolean;
}

export function DashboardSidebarLinks({ user, open, isCollapsed }: DashboardSidebarLinksProps) {
  const pathname = usePathname();

  // normalize role key to match routeConfig keys
  const roleKey = (user.role || '').toUpperCase();
  const groups: RouteGroups =
    routeConfig[roleKey] ?? routeConfig['ALL'] ?? ({} as RouteGroups);

  // combine system routes with main group for simplicity
  const primaryLinks: SidebarRoute[] = [
    ...systemRoutes,
    ...(groups.main ?? []),
  ];

  const renderLink = (link: SidebarRoute) => {
    const isActive = pathname === link.href;
    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          'flex items-center p-2 rounded-md text-sm font-medium transition-colors',
          isActive
            ? 'bg-neutral-700 text-white'
            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
        )}
      >
        {link.icon && <link.icon className="w-5 h-5 shrink-0" />}
        {open && <span className="ml-3 truncate">{link.label}</span>}
      </Link>
    );
  };

  return (
    <nav className="px-2 py-4 space-y-1">
      {primaryLinks.map(renderLink)}
      {/* future groups could be rendered here when open / collapsed */}
    </nav>
  );
}

