import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth'


export async function POST(request: Request) {
    try {
        const { email, password, firstName, lastName, organizationName } = await request.json()

        if (!email || !password || !organizationName) {
            return NextResponse.json(
                { error: 'Email, password and organization name are required' },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 409 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const organization = await prisma.organization.create({
            data: {
                name: organizationName,
                slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
            }
        });

        // Create the user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                emailVerified: false,
            }
        });

        // Link user to organization as PROPERTY_MANAGER
        await prisma.organizationUser.create({
            data: {
                userId: user.id,
                organizationId: organization.id,
                role: 'PROPERTY_MANAGER'
            }
        })


        // Generate tokens (consistent with your auth library)
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: 'PROPERTY_MANAGER',
            organizationId: organization.id
        })

        const refreshToken = generateRefreshToken({
            userId: user.id
        });

        const expiresAt = Date.now() + (60 * 60 * 1000) // 1 hour


        // Prepare response
        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: 'PROPERTY_MANAGER' as const,
            organization: {
                id: organization.id,
                name: organization.name,
                slug: organization.slug
            }
        }

        const response = NextResponse.json({
            user: userResponse,
            tokens: {
                accessToken,
                refreshToken,
                expiresAt
            }
        })

        // Set HTTP-only cookie
        response.cookies.set('token', accessToken, {
            httpOnly: true, // Changed to true for security
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
            path: '/',
        })

        return response

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}