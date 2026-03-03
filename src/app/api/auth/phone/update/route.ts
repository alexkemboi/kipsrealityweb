import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

    // Validate phone format (E.164)
    if (!phone.startsWith("+")) {
      return NextResponse.json({ error: "Phone number must be in E.164 format (e.g., +254712345678)" }, { status: 400 });
    }

    // Check if phone is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: { 
        phone,
        id: { not: userPayload.userId }
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Phone number is already in use" }, { status: 400 });
    }

    // 2. Update phone number and reset verification status
    await prisma.user.update({
        where: { id: userPayload.userId },
        data: { 
          phone,
          phoneVerified: null // Reset verification when phone changes
        }
    });

    return NextResponse.json({ success: true, message: "Phone number updated" });

  } catch (error) {
    console.error('Phone update error:', error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
