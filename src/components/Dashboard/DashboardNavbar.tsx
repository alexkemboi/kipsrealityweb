'use client'

import { useRouter } from 'next/navigation'
import { Bell, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLogout } from '@/hooks/useLogout'

interface DashboardNavbarProps {
  user: {
    id: string
    firstName: string
    role: string
    email: string
  }
  onMenuClick?: () => void
}

export function DashboardNavbar({ user, onMenuClick }: DashboardNavbarProps) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const { logout, isLoggingOut } = useLogout()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="bg-[#003b73] border-b border-[#002b5b]">
      {/* Top row: title + menu */}
      <div className="flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          {isMobile && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 text-blue-200 hover:text-white hover:bg-[#002b5b] rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-lg md:text-xl font-semibold text-white">
              Welcome back, {user.firstName}!
            </h1>
          </div>
        </div>

        {/* Desktop Right Section */}
        {!isMobile && (
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.firstName}</p>
                <p className="text-xs text-blue-200">{user.email}</p>
              </div>

              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.firstName.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-[#002b5b] rounded-lg border border-[#004b8d] transition"
              >
                Logout Build
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom row: icons only */}
      {isMobile && (
        <div className="flex justify-end gap-3 px-4 pb-3">
          <button className="p-2 text-blue-200 hover:text-white">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </div>
  )
}
