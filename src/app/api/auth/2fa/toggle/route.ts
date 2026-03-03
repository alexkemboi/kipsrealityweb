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

    const { enable } = await req.json();

    // 2. Security Check (If Enabling)
    if (enable) {
        const user = await prisma.user.findUnique({ where: { id: userPayload.userId }});
        if (!user?.phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }
        if (!user?.phoneVerified) {
            return NextResponse.json({ error: "Phone number must be verified first" }, { status: 400 });
        }
    }

    // 3. Update DB
    await prisma.user.update({
        where: { id: userPayload.userId },
        data: { twoFactorEnabled: enable }
    });

    return NextResponse.json({ success: true, enabled: enable });

  } catch (error) {
    console.error('2FA toggle error:', error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
