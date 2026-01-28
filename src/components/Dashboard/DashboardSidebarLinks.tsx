'use client'

import { motion } from 'framer-motion'
import { RouteGroup } from './RouteGroup'
import { systemRoutes, routeConfig } from './SidebarLinks'
import { LogOut } from 'lucide-react'
import { useLogout } from '@/hooks/useLogout';

interface DashboardSidebarLinksProps {
  user: { id: string, firstName: string, role: string, email: string }
  open?: boolean
  isCollapsed?: boolean
  darkMode?: boolean
}

export function DashboardSidebarLinks({ user, open = true, isCollapsed = false, darkMode = true }: DashboardSidebarLinksProps) {
  const userRoutes = routeConfig[user.role as keyof typeof routeConfig]
  const { logout } = useLogout({ redirectTo: '/' });

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex flex-1 flex-col justify-between overflow-hidden">
      <div className="flex-1 pr-2">
        {userRoutes.main && <RouteGroup routes={userRoutes.main} open={open} isCollapsed={isCollapsed} darkMode={darkMode} />}
        {Object.entries(userRoutes).map(([key, routes]: any) => key !== 'main' && routes && (
          <RouteGroup
            key={key}
            routes={routes}
            open={open}
            categoryLabel={key.charAt(0).toUpperCase() + key.slice(1)}
            isCollapsed={isCollapsed}
            darkMode={darkMode}
          />
        ))}
      </div>

      <div className="border-t pt-4 transition-colors duration-300">
        <RouteGroup routes={systemRoutes} open={open} isCollapsed={isCollapsed} darkMode={darkMode} />
        <div className="px-2 pb-2">
          <motion.button
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl p-3 w-full text-blue-200 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
            {open && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
