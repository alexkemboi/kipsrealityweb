import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GET /api/maintenance/recent
 * 
 * Returns recent maintenance requests.
 * Query params:
 *   - organizationId (required): The organization
 *   - propertyId (optional): Filter by specific property
 *   - status (optional): Filter by status (OPEN, IN_PROGRESS, etc)
 *   - limit (optional): Max results (default 10)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify auth
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Verify organization access
    const orgUser = await prisma.organizationUser.findFirst({
      where: { organizationId, userId: decoded.userId },
    });

    if (!orgUser) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build where clause
    const whereClause: any = { organizationId };

    if (propertyId) {
      whereClause.propertyId = propertyId;
    } else {
      // Get all properties for this org
      const properties = await prisma.property.findMany({
        where: { organizationId },
        select: { id: true },
      });
      const propertyIds = properties.map((p: any) => p.id);
      if (propertyIds.length === 0) {
        return NextResponse.json([]);
      }
      whereClause.propertyId = { in: propertyIds };
    }

    if (status) {
      whereClause.status = status;
    }

    // Fetch maintenance requests
    const requests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        createdAt: true,
        unit: {
          select: { unitNumber: true, unitName: true },
        },
        property: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Calculate time elapsed
    const now = new Date();
    const result = requests.map((request: any) => ({
      id: request.id,
      issue: request.title,
      description: request.description,
      unit: request.unit?.unitName || request.unit?.unitNumber || "N/A",
      propertyName: request.property?.name,
      priority: request.priority,
      status: request.status,
      submitted: formatTimeAgo(request.createdAt, now),
      submittedDate: request.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/maintenance/recent]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper to format time ago
function formatTimeAgo(date: Date, now: Date): string {
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
