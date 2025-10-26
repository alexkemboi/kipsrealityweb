'use client'

import { motion } from 'framer-motion'
import { DashboardSidebar } from '@/components/Dashboard/DashboardSidebar'
import { DashboardNavbar } from '@/components/Dashboard/DashboardNavbar'
import { DashboardProvider, useDashboard } from '@/context/DashboardContext'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'SYSTEM_ADMIN' | 'PROPERTY_MANAGER' | 'TENANT' | 'VENDOR'
  avatarUrl?: string
  organization?: {
    id: string
    name: string
    slug: string
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <ProtectedRoute>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </ProtectedRoute>
    </DashboardProvider>
  )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { isSidebarCollapsed } = useDashboard()

  // Show loading while auth is being checked
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // User is guaranteed to be on the correct dashboard thanks to middleware
  const transformedUser: User = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as 'SYSTEM_ADMIN' | 'PROPERTY_MANAGER' | 'TENANT' | 'VENDOR',
    avatarUrl: user.avatarUrl,
    organization: user.organization
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ease-in-out bg-white border-r h-screen sticky top-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        <DashboardSidebar user={transformedUser} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex-shrink-0 z-10 bg-white border-b">
          <DashboardNavbar user={transformedUser} />
        </header>

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto p-6 bg-gray-50"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}