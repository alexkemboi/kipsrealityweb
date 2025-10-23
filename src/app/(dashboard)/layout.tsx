'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardSidebar } from '@/components/Dashboard/DashboardSidebar'
import { DashboardNavbar } from '@/components/Dashboard/DashboardNavbar'
import { DashboardProvider, useDashboard } from '@/context/DashboardContext'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'property-manager' | 'tenant' | 'vendor'
  avatar?: string
  business?: {
    id: string
    name: string
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isSidebarCollapsed } = useDashboard()

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))?.split('=')[1]

    if (!token) {
      router.push('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium">Loading your dashboard...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ease-in-out bg-white border-r h-screen sticky top-0 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <DashboardSidebar user={user} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex-shrink-0 z-10 bg-white border-b">
          <DashboardNavbar user={user} />
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
