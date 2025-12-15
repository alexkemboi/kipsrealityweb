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
            consentNotifications: user.consentNotifications,
            consentMarketing: user.consentMarketing,
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

export async function PATCH(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.slice(7);
        const payload = verifyAccessToken(token);
        const body = await request.json();

        const { consentNotifications, consentMarketing } = body;

        // Update only provided fields
        const updateData: any = {};
        if (typeof consentNotifications === 'boolean') updateData.consentNotifications = consentNotifications;
        if (typeof consentMarketing === 'boolean') updateData.consentMarketing = consentMarketing;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: payload.userId },
            data: updateData,
            select: {
                consentNotifications: true,
                consentMarketing: true
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Update preferences error:', error);
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }
}