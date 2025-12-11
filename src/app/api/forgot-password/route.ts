import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // NOTE: Frontend-facing mock handler. The backend team should
    // implement the real mail/send and token logic. Options:
    // - Proxy this request to the backend service here.
    // - Replace this file with logic that sends email using a service.

    // For now, return a successful JSON response so the frontend flow works.
    return NextResponse.json({ message: 'Password reset link sent' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}