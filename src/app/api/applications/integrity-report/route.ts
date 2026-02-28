import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { applicationControlService } from "@/lib/application-control-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const propertyId = url.searchParams.get("propertyId")?.trim() || undefined;

    const report =
      await applicationControlService.getApplicationIntegrityReport(propertyId);

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("Error generating application integrity report:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { action?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const action = body?.action;

    if (action === "fix-associations") {
      const result =
        await applicationControlService.validateAndFixApplicationAssociations();

      return NextResponse.json(
        {
          action: "fix-associations",
          ...result,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: fix-associations" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error performing integrity action:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
