'use client'

import { motion } from 'framer-motion'
import { RouteGroup } from './RouteGroup'
import { systemRoutes, routeConfig } from './SidebarLinks'
import { LogOut } from 'lucide-react'

interface DashboardSidebarLinksProps {
  user: { id: string, firstName: string, role: string, email: string }
  open?: boolean
  isCollapsed?: boolean
  darkMode?: boolean
}

export function DashboardSidebarLinks({ user, open = true, isCollapsed = false, darkMode = true }: DashboardSidebarLinksProps) {
  const userRoutes = routeConfig[user.role as keyof typeof routeConfig]

  const handleLogout = async () => {
    // TODO: Handle Logout 
  }

  return (
    <motion.div className="flex flex-1 flex-col justify-between overflow-hidden" layout>
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2">
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
            className="flex items-center gap-3 rounded-xl p-3 w-full text-neutral-700 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            {open && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
