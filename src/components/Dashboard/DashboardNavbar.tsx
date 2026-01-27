'use client'

import { useRouter } from 'next/navigation'
import { Bell, Search, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { UserNav } from './UserNav'

interface DashboardNavbarProps {
  user: {
    id: string
    firstName: string
    lastName?: string
    role: string
    email: string
    avatarUrl?: string | null
  }
  onMenuClick?: () => void
}

export function DashboardNavbar({ user, onMenuClick }: DashboardNavbarProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="bg-[#003b73] border-b border-[#002b59] sticky top-0 z-30">
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

          <div className="hidden md:block">
            <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
              Dashboard
            </h2>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop Search */}
          {!isMobile && (
            <div className="relative mr-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 w-48 lg:w-64 text-sm"
              />
            </div>
          )}

          {/* Mobile Search Toggle */}
          {isMobile && (
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Notification Bell */}
          <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#002b59]"></span>
          </button>

          {/* User Profile Dropdown */}
          <UserNav user={user} />
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {isMobile && showMobileSearch && (
        <div className="px-4 pb-3 animate-in slide-in-from-top duration-200">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-10 py-2 w-full bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 text-sm"
              autoFocus
            />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

