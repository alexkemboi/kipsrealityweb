import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

function normalizeUsPhoneToE164(input: string): string | null {
  // Keep digits only
  const digits = input.replace(/\D/g, "");

  // 10-digit US number -> +1XXXXXXXXXX
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // 11-digit US number starting with 1 -> +1XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    // 1. Verify User
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let userPayload: { userId: string };
    try {
      userPayload = verifyAccessToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const rawPhone = typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!rawPhone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Normalize US phone to E.164 (+1XXXXXXXXXX)
    const phone = normalizeUsPhoneToE164(rawPhone);
    if (!phone) {
      return NextResponse.json(
        {
          error:
            "Enter a valid US phone number (e.g., (206) 555-1234, 206-555-1234, or +1 206 555 1234)",
        },
        { status: 400 }
      );
    }

    // Check if phone is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: userPayload.userId },
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Phone number is already in use" }, { status: 400 });
    }

    // 2. Update phone number and reset verification status
    await prisma.user.update({
      where: { id: userPayload.userId },
      data: {
        phone,
        phoneVerified: null, // Reset verification when phone changes
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number updated",
      phone, // normalized stored value: +1XXXXXXXXXX
    });
  } catch (error) {
    console.error("Phone update error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
