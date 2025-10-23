import { NextResponse } from 'next/server'
import { generateJWT } from '@/lib/auth'
import { mockUsers } from "@/lib/mock-users"

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // Simulate database lookup
        const user = mockUsers.find(u => u.email === email && u.password === password)

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Generate JWT token
        const token = generateJWT({
            userId: user.id,
            email: user.email,
            role: user.role
        })

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user

        const response = NextResponse.json({
            user: userWithoutPassword,
            token
        })

        // Set HTTP-only cookie
        // Set cookie with proper options
        response.cookies.set('token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict'
            maxAge: 86400, // 24 hours
            path: '/', // Make sure it's available on all paths
        })

        return response
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    const response = NextResponse.json({ message: 'Logged out successfully' })
    response.cookies.delete('token')
    return response
}