'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { RouteItem } from './RouteItem'

interface RouteGroupProps {
  routes: any[]
  open: boolean
  categoryLabel?: string
  isCollapsed?: boolean
  darkMode?: boolean
}

export function RouteGroup({ routes, open, categoryLabel, isCollapsed, darkMode }: RouteGroupProps) {
  const pathname = usePathname()

  return (
    <div className="w-full mb-2">
      {categoryLabel && open && (
        <p
          className={darkMode ? "text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3 px-3" : "text-blue-200 text-xs font-semibold uppercase tracking-wider mb-3 px-3"}
        >
          {categoryLabel}
        </p>
      )}
      <div className="space-y-1 px-2">
        {routes.map((route) => (
          <RouteItem
            key={route.label}
            route={route}
            open={open}
            isActive={pathname === route.path}
            isCollapsed={isCollapsed}
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  )
}
