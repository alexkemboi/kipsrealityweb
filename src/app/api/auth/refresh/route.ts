import { NextResponse } from 'next/server'
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
    try {
        const { refreshToken } = await request.json()

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'Refresh token required' },
                { status: 400 }
            )
        }

        const payload = verifyRefreshToken(refreshToken)

        // Check if user still exists and is active
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
                { error: 'Invalid refresh token' },
                { status: 401 }
            )
        }

        const primaryOrgUser = user.organizationUsers[0]

        if (!primaryOrgUser) {
            return NextResponse.json(
                { error: 'No organization assigned' },
                { status: 403 }
            )
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: primaryOrgUser.role,
            organizationId: primaryOrgUser.organizationId
        })

        const expiresAt = Date.now() + (60 * 60 * 1000)

        return NextResponse.json({
            accessToken: newAccessToken,
            refreshToken: refreshToken,
            expiresAt
        })

    } catch (error) {
        console.error('Token refresh error:', error)
        return NextResponse.json(
            { error: 'Invalid refresh token' },
            { status: 401 }
        )
    }
}