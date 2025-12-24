import { NextResponse } from 'next/server'

export async function POST() {
    
    const response = NextResponse.json({
        success: true,
        message: 'Logged out successfully'
    });

    // Clear the authentication cookie
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        expires: new Date(0) // Set expiration to past date
    });

    return response;
}