import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBaseUrl } from '@/lib/constants'; // Import the helper

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Helper using dynamic base URL
    const redirectToLogin = (params: string) => {
        return NextResponse.redirect(`${getBaseUrl()}/login?${params}`);
    };

    if (!token) {
        return redirectToLogin('error=missing_token');
    }

    try {
        // 1. Find user with this token
        const user = await prisma.user.findUnique({
            where: { verificationToken: token }
        });

        if (!user) {
            return redirectToLogin('error=invalid_token');
        }

        // 2. Update User: Mark verified and remove token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null // Important: Invalidate token so it can't be reused
            }
        });

        // 3. Redirect to Login Page with success
        return redirectToLogin('verified=true');

    } catch (error) {
        console.error("Verification Error", error);
        return redirectToLogin('error=server_error');
    }
}
