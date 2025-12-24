'use client'

import { useRouter } from 'next/navigation'
import { Bell, Search, Settings, Menu, X } from 'lucide-react'
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
  const [showMobileSearch, setShowMobileSearch] = useState(false)
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
    <div className="bg-[#0a1628] border-b border-neutral-800">
      {/* Top row: title + menu */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-4">
          {isMobile && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-lg md:text-xl font-semibold text-white">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 capitalize">
              {user.role.replace('-', ' ')} Dashboard
            </p>
          </div>
        </div>

        {/* Desktop Right Section */}
        {!isMobile && (
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>

            <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition">
              <Bell className="w-5 h-5" />
            </button>

            <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition">
              <Settings className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.firstName}</p>
                <p className="text-xs text-neutral-400">{user.email}</p>
              </div>

              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.firstName.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg border border-neutral-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom row: search + icons */}
      {isMobile && (
        <div className="flex flex-col gap-2 px-4 pb-3">
          {showMobileSearch && (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-10 py-2 w-full bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition flex-1 mr-2"
            >
              <Search className="w-5 h-5" />
            </button>

            <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition">
              <Bell className="w-5 h-5" />
            </button>

            <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition">
              <Settings className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

