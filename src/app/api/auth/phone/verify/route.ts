import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { verifyOtp } from "@/lib/auth/otp";

export async function POST(req: Request) {
  try {
    // 1. Verify User
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    let userPayload;
    try {
        userPayload = verifyAccessToken(token);
    } catch(e) {
        return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone number and code are required" }, { status: 400 });
    }

    // 2. Verify OTP
    const isValid = await verifyOtp(userPayload.userId, code, 'PHONE_VERIFICATION');

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // 3. Mark phone as verified
    await prisma.user.update({
        where: { id: userPayload.userId },
        data: { phoneVerified: new Date() }
    });

    return NextResponse.json({ success: true, message: "Phone number verified successfully" });

  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
