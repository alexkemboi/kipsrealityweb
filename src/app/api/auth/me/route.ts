import { NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            )
        }

        const token = authHeader.slice(7)
        const payload = verifyAccessToken(token)

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
                organizationUsers: {
                    include: {
                        organization: true
                    }
                }
            }
        })

        if (!user || user.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const primaryOrgUser = user.organizationUsers[0]

        if (!primaryOrgUser) {
            return NextResponse.json(
                { error: 'No organization assigned' },
                { status: 403 }
            )
        }

        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: primaryOrgUser.role,
            organization: {
                id: primaryOrgUser.organization.id,
                name: primaryOrgUser.organization.name,
                slug: primaryOrgUser.organization.slug
            }
        }

        return NextResponse.json(userResponse)

    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
        )
    }
}