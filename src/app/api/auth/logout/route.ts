import { NextResponse } from 'next/server'

export async function POST() {
    // Since we're using localStorage, we don't need to do much server-side
    // But we can add logging or token blacklisting here if needed

    return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
    })
};