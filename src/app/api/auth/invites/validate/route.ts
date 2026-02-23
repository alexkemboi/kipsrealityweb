import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required." },
        { status: 400 }
      );
    }

    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        organization: {
          select: { name: true },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { valid: false, error: "Invalid invite link." },
        { status: 404 }
      );
    }

    if (invite.accepted) {
      return NextResponse.json(
        { valid: false, error: "This invite has already been used." },
        { status: 409 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "This invite link has expired." },
        { status: 410 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        email: invite.email,
        role: invite.role,
        organizationName: invite.organization?.name ?? null,
        expiresAt: invite.expiresAt,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/invite/validate]", error);

    return NextResponse.json(
      { valid: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
