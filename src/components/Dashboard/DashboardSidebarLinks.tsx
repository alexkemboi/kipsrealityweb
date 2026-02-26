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

import { filterLinks } from '@/lib/filters'

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
