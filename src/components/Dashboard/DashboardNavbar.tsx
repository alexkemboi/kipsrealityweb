'use client'

import { useRouter } from 'next/navigation'
import { Bell, Search, Settings, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface DashboardNavbarProps {
    user: {
        id: string
        name: string
        role: string
        email: string
    }
    onMenuClick?: () => void
}

export function DashboardNavbar({ user, onMenuClick }: DashboardNavbarProps) {
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' })
        router.push('/login')
    }

    return (
        <div className="bg-neutral-900 border-b border-neutral-800">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    {isMobile && onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}

                    <div>
                        <h1 className="text-lg md:text-xl font-semibold text-white">
                            Welcome back, {user.name}!
                        </h1>
                        <p className="text-xs md:text-sm text-neutral-400 capitalize">
                            {user.role.replace('-', ' ')} Dashboard
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search Bar - Hidden on mobile */}
                    {!isMobile && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 w-48 md:w-64"
                            />
                        </div>
                    )}

                    {/* Icons */}
                    <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg">
                        <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg">
                        <Settings className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    {/* User Profile - Simplified on mobile */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {!isMobile && (
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">{user.name}</p>
                                <p className="text-xs text-neutral-400">{user.email}</p>
                            </div>
                        )}

                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                        </div>

                        {!isMobile && (
                            <button
                                onClick={handleLogout}
                                className="px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg border border-neutral-700"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}