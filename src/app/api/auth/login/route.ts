import { NextResponse } from 'next/server'
import { generateJWT } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // Input validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Find user in database
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                organizationUsers: {
                    include: {
                        organization: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Get user's primary organization and role
        const primaryOrgUser = user.organizationUsers[0]
        const role = primaryOrgUser?.role || 'TENANT'

        // Generate JWT token
        const token = generateJWT({
            userId: user.id,
            email: user.email,
            role: role
        })

        // Prepare user response (remove sensitive data)
        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: role,
            organization: primaryOrgUser?.organization
        }

        const response = NextResponse.json({
            user: userResponse,
            token
        })

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400,
            path: '/',
        })

        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}