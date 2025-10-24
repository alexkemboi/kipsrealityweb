'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useDashboard } from '@/context/DashboardContext'

interface RouteItemProps {
  route: any
  open: boolean
  isActive: boolean
  isCollapsed?: boolean
  darkMode?: boolean
}

export function RouteItem({ route, open, isActive, isCollapsed, darkMode }: RouteItemProps) {
  const { setSelected } = useDashboard()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault() 
    setSelected(route.label) 
    window.history.replaceState(null, '', '/dashboard/vendor') 
    // optional: ensures URL stays the same (optional)
  }

  const ItemContent = () => (
    <motion.div
      whileHover={{ scale: isCollapsed ? 1 : 1.02, x: isCollapsed ? 0 : 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-3 rounded-xl p-3 transition-all duration-300 relative group border-r-2 cursor-pointer",
        darkMode
          ? isActive
            ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/5 text-cyan-400 border-cyan-500 shadow-lg shadow-cyan-500/10"
            : "text-neutral-400 hover:text-white hover:bg-neutral-800/60 border-transparent hover:border-cyan-500/30"
          : isActive
            ? "bg-gradient-to-r from-blue-50 to-cyan-50/50 text-blue-700 border-blue-500 shadow-sm"
            : "text-neutral-700 hover:text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-200"
      )}
      onClick={handleClick} 
    >
      <route.icon className={cn(
        "w-5 h-5 flex-shrink-0 transition-colors duration-300",
        darkMode
          ? isActive ? "text-cyan-400" : "text-neutral-500 group-hover:text-cyan-400"
          : isActive ? "text-blue-600" : "text-neutral-500 group-hover:text-blue-500"
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
            <span className="text-sm font-medium whitespace-nowrap truncate">{route.label}</span>
            {route.badge && (
              <span className={cn(
                "px-1.5 py-0.5 text-xs rounded-full font-medium transition-colors duration-300",
                darkMode
                  ? isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-neutral-700 text-neutral-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400"
                  : isActive ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-600 group-hover:bg-blue-100 group-hover:text-blue-700"
              )}>
                {route.badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  // Tooltip for collapsed sidebar
  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div onClick={handleClick}>
            <ItemContent />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className={cn(darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900")}>
          <route.icon className="w-4 h-4" />
          <span>{route.label}</span>
          {route.badge && (
            <span className={cn(darkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-blue-100 text-blue-700")}>
              {route.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return <ItemContent />
}
