import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type ToggleBody = {
  enabled?: boolean;
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: ToggleBody = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { error: "Field 'enabled' (boolean) is required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: body.enabled,
      },
      select: {
        id: true,
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        enabled: updatedUser.twoFactorEnabled,
        message: `Two-factor authentication ${
          updatedUser.twoFactorEnabled ? "enabled" : "disabled"
        } successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/auth/2fa/toggle]", error);

    return NextResponse.json(
      {
        error: "Failed to update 2FA setting",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
