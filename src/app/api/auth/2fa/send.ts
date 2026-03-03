import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { createOtp } from "@/lib/auth/otp";

export async function POST(req: Request) {
  const { userId } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user || !user.phone) {
    return NextResponse.json({ error: "User has no phone number" }, { status: 400 });
  }

  // Generate & Save
  const code = await createOtp(user.id, user.phone, 'TWO_FACTOR');

  // Send SMS
  await sendSms(user.phone, `Your RentFlow360 code is: ${code}. Valid for 5 minutes.`);

  return NextResponse.json({ success: true, message: "Code sent" });
}