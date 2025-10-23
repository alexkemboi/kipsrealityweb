'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DashboardContextType {
  selected: string
  setSelected: (label: string) => void
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState('Overview')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev)

  return (
    <DashboardContext.Provider
      value={{ selected, setSelected, isSidebarCollapsed, toggleSidebar }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
