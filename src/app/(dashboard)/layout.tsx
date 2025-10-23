'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardSidebar } from '@/components/Dashboard/DashboardSidebar'
import { DashboardNavbar } from '@/components/Dashboard/DashboardNavbar'

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
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const allCookies = document.cookie.split('; ')
        console.log("Cooooookie", allCookies);
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
        console.log("yoooo", token)

        if (!token) {
            router.push('/login')
            return
        }

        // Fetch complete user data
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
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
                <div className="text-lg">Loading your dashboard...</div>
            </div>
        )
    }

    if (!user) return null

    // Role-specific checks (similar to your business logic)
    if (user.role === 'property-manager' && !userHasProperties(user)) {
        return (
            <div className="bg-gray-50 flex min-h-screen items-center justify-center px-[20%] py-[10%]">
                <div>Create First Property Form</div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar user={user} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardNavbar user={user} />
                <motion.main
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex-1 overflow-auto p-6"
                >
                    {children}
                </motion.main>
            </div>
        </div>
    )
}

// Helper function (you can expand this)
function userHasProperties(user: User): boolean {
    // Implement your property check logic here
    return true // placeholder
}