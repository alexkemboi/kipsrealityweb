import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { sendSms } from "@/lib/sms";
import { createOtp } from "@/lib/auth/otp";

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

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // 2. Generate and send OTP
    const code = await createOtp(userPayload.userId, phone, 'PHONE_VERIFICATION');
    
    await sendSms(phone, `Your RentFlow360 verification code is: ${code}. Valid for 5 minutes.`);

    return NextResponse.json({ success: true, message: "Verification code sent" });

  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
