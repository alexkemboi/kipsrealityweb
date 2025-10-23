// src/components/dashboard/DashboardSidebarLinks.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  Building,
  Users,
  Wrench,
  FileText,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut,
  DollarSign,
  Calendar,
  ClipboardList,
  Shield,
  Cog,
  PieChart,
  MessageSquare,
  Mail
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface DashboardSidebarLinksProps {
  user: {
    id: string
    name: string
    role: string
    email: string
  }
  open?: boolean
  isCollapsed?: boolean
  darkMode?: boolean
}

const delayDuration = 0.2

// Enhanced role-specific route configurations
const routeConfig = {
  admin: {
    main: [
      { path: '/dashboard/admin', label: 'Overview', icon: Home, badge: null },
      { path: '/dashboard/admin/users', label: 'User Management', icon: Users, badge: null },
      { path: '/dashboard/admin/properties', label: 'All Properties', icon: Building, badge: null },
      { path: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3, badge: 'New' },
    ],
    system: [
      { path: '/dashboard/admin/security', label: 'Security', icon: Shield, badge: null },
      { path: '/dashboard/admin/system', label: 'System Settings', icon: Cog, badge: null },
      { path: '/dashboard/admin/reports', label: 'Reports', icon: FileText, badge: null },
    ]
  },
  'property-manager': {
    main: [
      { path: '/dashboard/property-manager', label: 'Overview', icon: Home, badge: null },
      { path: '/dashboard/property-manager/properties', label: 'My Properties', icon: Building, badge: '3' },
      { path: '/dashboard/property-manager/tenants', label: 'Tenants', icon: Users, badge: '12' },
      { path: '/dashboard/property-manager/maintenance', label: 'Maintenance', icon: Wrench, badge: '5' },
    ],
    financial: [
      { path: '/dashboard/property-manager/rent', label: 'Rent Collection', icon: DollarSign, badge: null },
      { path: '/dashboard/property-manager/analytics', label: 'Analytics', icon: PieChart, badge: null },
    ],
    communication: [
      { path: '/dashboard/property-manager/messages', label: 'Messages', icon: MessageSquare, badge: '3' },
      { path: '/dashboard/property-manager/notifications', label: 'Notifications', icon: Bell, badge: null },
    ]
  },
  tenant: {
    main: [
      { path: '/dashboard/tenant', label: 'Overview', icon: Home, badge: null },
      { path: '/dashboard/tenant/rent', label: 'Pay Rent', icon: DollarSign, badge: 'Due' },
      { path: '/dashboard/tenant/maintenance', label: 'Maintenance', icon: Wrench, badge: null },
      { path: '/dashboard/tenant/lease', label: 'My Lease', icon: FileText, badge: null },
    ],
    communication: [
      { path: '/dashboard/tenant/messages', label: 'Messages', icon: MessageSquare, badge: '2' },
      { path: '/dashboard/tenant/notifications', label: 'Notifications', icon: Bell, badge: null },
    ]
  },
  vendor: {
    main: [
      { path: '/dashboard/vendor', label: 'Overview', icon: Home, badge: null },
      { path: '/dashboard/vendor/jobs', label: 'My Jobs', icon: ClipboardList, badge: '4' },
      { path: '/dashboard/vendor/schedule', label: 'Schedule', icon: Calendar, badge: null },
      { path: '/dashboard/vendor/invoices', label: 'Invoices', icon: DollarSign, badge: '2' },
    ],
    communication: [
      { path: '/dashboard/vendor/messages', label: 'Messages', icon: MessageSquare, badge: '1' },
      { path: '/dashboard/vendor/notifications', label: 'Notifications', icon: Bell, badge: null },
    ]
  }
}

// System routes (common for all roles)
const systemRoutes = [
  { path: '/dashboard/profile', label: 'Profile', icon: User, badge: null },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings, badge: null },
]

// Enhanced Route Item with dark mode support
function RouteItem({ 
  route, 
  open, 
  isActive,
  isCollapsed,
  darkMode 
}: { 
  route: any
  open: boolean
  isActive: boolean
  isCollapsed?: boolean
  darkMode?: boolean
}) {
  const ItemContent = () => (
    <motion.div
      whileHover={{ 
        scale: isCollapsed ? 1 : 1.02,
        x: isCollapsed ? 0 : 2
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-3 rounded-xl p-3 transition-all duration-300 relative group border-r-2",
        darkMode
          ? isActive
            ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/5 text-cyan-400 border-cyan-500 shadow-lg shadow-cyan-500/10"
            : "text-neutral-400 hover:text-white hover:bg-neutral-800/60 border-transparent hover:border-cyan-500/30"
          : isActive
            ? "bg-gradient-to-r from-blue-50 to-cyan-50/50 text-blue-700 border-blue-500 shadow-sm"
            : "text-neutral-700 hover:text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-200"
      )}
    >
      <route.icon className={cn(
        "w-5 h-5 flex-shrink-0 transition-colors duration-300",
        darkMode
          ? isActive 
            ? "text-cyan-400" 
            : "text-neutral-500 group-hover:text-cyan-400"
          : isActive 
            ? "text-blue-600" 
            : "text-neutral-500 group-hover:text-blue-500"
      )} />
      
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex items-center justify-between min-w-0"
          >
            <span className="text-sm font-medium whitespace-nowrap truncate">
              {route.label}
            </span>
            {route.badge && (
              <span className={cn(
                "px-1.5 py-0.5 text-xs rounded-full font-medium transition-colors duration-300",
                darkMode
                  ? isActive
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-neutral-700 text-neutral-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400"
                  : isActive
                    ? "bg-blue-100 text-blue-700"
                    : "bg-neutral-100 text-neutral-600 group-hover:bg-blue-100 group-hover:text-blue-700"
              )}>
                {route.badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={route.path} className="block">
            <ItemContent />
          </Link>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className={cn(
            "flex items-center gap-2 transition-colors duration-300",
            darkMode 
              ? "bg-neutral-800 border-neutral-700 text-white" 
              : "bg-white border-neutral-200 text-neutral-900"
          )}
        >
          <route.icon className="w-4 h-4" />
          <span>{route.label}</span>
          {route.badge && (
            <span className={cn(
              "px-1.5 py-0.5 text-xs rounded-full font-medium",
              darkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-blue-100 text-blue-700"
            )}>
              {route.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link href={route.path} className="block">
      <ItemContent />
    </Link>
  )
}

// Enhanced Route Group with dark mode
function RouteGroup({ 
  routes, 
  open, 
  categoryLabel,
  isCollapsed,
  darkMode 
}: { 
  routes: any[]
  open: boolean
  categoryLabel?: string
  isCollapsed?: boolean
  darkMode?: boolean
}) {
  const pathname = usePathname()

  return (
    <motion.div
      className="w-full mb-6"
      layout
      transition={{ duration: delayDuration, ease: "easeIn" }}
    >
      {categoryLabel && open && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "text-xs font-semibold uppercase tracking-wider mb-3 px-3 transition-colors duration-300",
            darkMode ? "text-neutral-500" : "text-neutral-500"
          )}
        >
          {categoryLabel}
        </motion.p>
      )}
      <div className="space-y-1 px-2">
        {routes.map((route) => (
          <RouteItem
            key={route.path}
            route={route}
            open={open}
            isActive={pathname === route.path}
            isCollapsed={isCollapsed}
            darkMode={darkMode}
          />
        ))}
      </div>
    </motion.div>
  )
}

export function DashboardSidebarLinks({ user, open = true, isCollapsed = false, darkMode = true }: DashboardSidebarLinksProps) {
  const userRoutes = routeConfig[user.role as keyof typeof routeConfig]

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/login'
  }

  return (
    <motion.div
      className="flex flex-1 flex-col justify-between"
      layout
      transition={{ duration: delayDuration, ease: "easeIn" }}
    >
      {/* Main Navigation */}
      <div className="flex-1">
        {/* Main Routes */}
        <RouteGroup 
          routes={userRoutes.main} 
          open={open} 
          isCollapsed={isCollapsed}
          darkMode={darkMode}
        />

        {/* Additional Route Groups */}
        {/* {userRoutes.financial && (
          <RouteGroup 
            routes={userRoutes.financial} 
            open={open} 
            categoryLabel="FINANCIAL"
            isCollapsed={isCollapsed}
            darkMode={darkMode}
          />
        )} */}

        {/* {userRoutes.communication && (
          <RouteGroup 
            routes={userRoutes.communication} 
            open={open} 
            categoryLabel="COMMUNICATION"
            isCollapsed={isCollapsed}
            darkMode={darkMode}
          />
        )} */}

        {/* {userRoutes.system && (
          <RouteGroup 
            routes={userRoutes.system} 
            open={open} 
            categoryLabel="SYSTEM"
            isCollapsed={isCollapsed}
            darkMode={darkMode}
          />
        )} */}
      </div>

      {/* System Routes & Logout */}
      <motion.div
        className={cn(
          "border-t pt-4 transition-colors duration-300",
          darkMode ? "border-neutral-800/60" : "border-neutral-100"
        )}
        layout
        transition={{ duration: delayDuration, ease: "easeIn" }}
      >
        <RouteGroup 
          routes={systemRoutes} 
          open={open} 
          isCollapsed={isCollapsed}
          darkMode={darkMode}
        />

        {/* Enhanced Logout Button */}
        <div className="px-2">
          {open ? (
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3 transition-all duration-300 w-full border-r-2 border-transparent",
                darkMode
                  ? "text-neutral-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                  : "text-neutral-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
              )}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium whitespace-nowrap">Logout</span>
            </motion.button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className={cn(
                    "w-full p-3 rounded-xl transition-colors duration-300",
                    darkMode
                      ? "text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                      : "text-neutral-700 hover:text-red-600 hover:bg-red-50"
                  )}
                >
                  <LogOut className="w-5 h-5 mx-auto" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent 
                side="right"
                className={cn(
                  "transition-colors duration-300",
                  darkMode 
                    ? "bg-neutral-800 border-neutral-700 text-white" 
                    : "bg-white border-neutral-200 text-neutral-900"
                )}
              >
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}