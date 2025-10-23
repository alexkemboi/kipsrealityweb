// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { mockUsers } from '@/lib/mock-users'

export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json({ error: 'No token' }, { status: 401 })
        }

        const payload = verifyJWT(token)
        const user = mockUsers.find(u => u.id === payload.userId)

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({ user: userWithoutPassword })
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
}