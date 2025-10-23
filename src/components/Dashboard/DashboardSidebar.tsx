'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Building2, Menu, X } from 'lucide-react'
import { DashboardSidebarLinks } from './DashboardSidebarLinks'
import { cn } from '@/lib/utils'

interface DashboardSidebarProps {
    user: {
        id: string
        name: string
        role: string
        email: string
        avatar?: string
    }
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
    const [isMobile, setIsMobile] = useState(false)
    const [open, setOpen] = useState(true)
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        if (isMobile) {
            setOpen(false)
        } else {
            setOpen(true)
        }
    }, [isMobile])

    // Desktop Sidebar Component
    const DesktopSidebar = () => (
        <div
            className={cn(
                "hidden md:flex h-screen flex-col bg-neutral-900 border-r border-neutral-800 transition-all duration-200",
                open ? "w-64" : "w-20"
            )}
        >
            {/* Header Section */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                {open &&
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="font-bold text-white text-lg">RentFlow360</h1>
                            <p className="text-xs text-neutral-400 capitalize">
                                {user.role.replace('-', ' ')}
                            </p>
                        </div>
                    </div>
                }

                {!isMobile && (
                    <button
                        onClick={() => setOpen(!open)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                    >
                        <ChevronLeft className={cn("w-4 h-4", !open && "rotate-180")} />
                    </button>
                )}
            </div>

            {/* Navigation Section */}
            <div className="flex-1 py-4 overflow-hidden">
                <DashboardSidebarLinks
                    user={user}
                    open={open}
                    isCollapsed={!open}
                />
            </div>

            {/* User Profile Section */}
            <div className="border-t border-neutral-800 p-4">
                {open ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium mx-auto">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    )

    // Mobile Drawer Component
    const MobileDrawer = () => (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileDrawerOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Drawer Overlay */}
            {mobileDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setMobileDrawerOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="md:hidden fixed left-0 top-0 h-full w-80 z-50 flex flex-col bg-neutral-950 border-r border-neutral-800">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-white text-lg">RentFlow360</h1>
                                    <p className="text-xs text-neutral-400 capitalize">
                                        {user.role.replace('-', ' ')}
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setMobileDrawerOpen(false)}
                                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <div className="flex-1 py-4 overflow-y-auto">
                            <DashboardSidebarLinks
                                user={user}
                                open={true}
                                isCollapsed={false}
                            />
                        </div>

                        {/* Mobile User Profile */}
                        <div className="border-t border-neutral-800 p-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-neutral-400 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )

    return (
        <>
            <DesktopSidebar />
            <MobileDrawer />
        </>
    )
}