import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // 1. Find the invite
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        organization: {
          select: { name: true } // Fetch org name to show "Join Kips Realty"
        }
      }
    });

    // 2. Validate status
    if (!invite) {
      return NextResponse.json({ valid: false, error: "Invalid invite link." }, { status: 404 });
    }

    if (invite.accepted) {
      return NextResponse.json({ valid: false, error: "This invite has already been used." }, { status: 409 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ valid: false, error: "This invite link has expired." }, { status: 410 });
    }

    // 3. Return safe data to frontend
    return NextResponse.json({
      valid: true,
      email: invite.email,
      role: invite.role,
      organizationName: invite.organization.name
    });

  } catch (error) {
    console.error("Invite Validation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}