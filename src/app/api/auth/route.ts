import { NextResponse } from 'next/server'


export async function DELETE() {
    const response = NextResponse.json({ message: 'Logged out successfully' })
    response.cookies.delete('token')
    return response
}