import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateJWT } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const { email, password, firstName, lastName, organizationName } = await request.json()

        // Input validation
        if (!email || !password || !organizationName) {
            return NextResponse.json(
                { error: 'Email, password and organization name are required' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create the organization first
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


        // Generate JWT token
        const token = generateJWT({
            userId: user.id,
            email: user.email,
            role: 'PROPERTY_MANAGER'
        })

        // Prepare response
        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: 'PROPERTY_MANAGER',
            organization: organization
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
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}