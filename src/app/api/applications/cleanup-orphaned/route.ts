import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type CleanupBody = {
  dryRun?: boolean;
};

type AllowedRole = "SYSTEM_ADMIN" | "PROPERTY_MANAGER";

function buildOrphanedApplicationsWhere(params: {
  userId: string;
  role: AllowedRole;
  organizationId?: string | null;
}): Prisma.tenantapplicationWhereInput {
  const { userId, role, organizationId } = params;

  const propertyFilter: Record<string, unknown> = {};

  // Scope property managers to only their properties
  if (role === "PROPERTY_MANAGER") {
    propertyFilter.manager = { userId };
  }

  // Optional org safety scope (if your schema supports property.organizationId)
  if (organizationId) {
    propertyFilter.organizationId = organizationId;
  }

  return {
    status: "PENDING",
    // "Orphaned" = application linked to a unit, but that unit has no listing
    unit: {
      listing: null,
    },
    ...(Object.keys(propertyFilter).length > 0
      ? {
          property: propertyFilter as Prisma.propertyWhereInput,
        }
      : {}),
  };
}

export async function POST(request: Request) {
  try {
    // If your helper is no-arg in your project, change this line to: getCurrentUser()
    const user = await getCurrentUser(request);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.organizationUser.findFirst({
      where: {
        userId: user.id,
        role: {
          in: ["SYSTEM_ADMIN", "PROPERTY_MANAGER"],
        },
      },
      select: {
        id: true,
        role: true,
        organizationId: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. Only admins and property managers can cleanup orphaned applications.",
        },
        { status: 403 }
      );
    }

    let body: CleanupBody = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const dryRun = body?.dryRun === true;

    const where = buildOrphanedApplicationsWhere({
      userId: user.id,
      role: membership.role as AllowedRole,
      organizationId: membership.organizationId ?? undefined,
    });

    // Shared select shape for BOTH dry-run and actual cleanup preview
    const selectShape = {
      id: true,
      fullName: true,
      email: true,
      unitId: true,
      propertyId: true,
      createdAt: true,
      unit: {
        select: {
          id: true,
          unitNumber: true,
        },
      },
      property: {
        select: {
          id: true,
          name: true,
        },
      },
    } satisfies Prisma.tenantapplicationSelect;

    // ------------------------------------------------------------
    // DRY RUN (uses same filter)
    // ------------------------------------------------------------
    if (dryRun) {
      const orphanedApplications = await prisma.tenantapplication.findMany({
        where,
        select: selectShape,
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        {
          dryRun: true,
          wouldCleanup: orphanedApplications.length,
          applications: orphanedApplications.map((app) => ({
            id: app.id,
            fullName: app.fullName,
            email: app.email,
            unitId: app.unitId,
            unitNumber: app.unit?.unitNumber ?? null,
            propertyId: app.propertyId,
            propertyName: app.property?.name ?? null,
            createdAt: app.createdAt,
          })),
        },
        { status: 200 }
      );
    }

    // ------------------------------------------------------------
    // ACTUAL CLEANUP (uses SAME filter, then deletes exact matched IDs)
    // ------------------------------------------------------------
    const cleanupResult = await prisma.$transaction(async (tx) => {
      const targets = await tx.tenantapplication.findMany({
        where,
        select: selectShape,
        orderBy: { createdAt: "desc" },
      });

      if (targets.length === 0) {
        return {
          cleaned: 0,
          applications: [] as typeof targets,
        };
      }

      const ids = targets.map((a) => a.id);

      const deleted = await tx.tenantapplication.deleteMany({
        where: {
          id: { in: ids },
        },
      });

      return {
        cleaned: deleted.count,
        applications: targets,
      };
    });

    return NextResponse.json(
      {
        dryRun: false,
        cleaned: cleanupResult.cleaned,
        success: true,
        applications: cleanupResult.applications.map((app) => ({
          id: app.id,
          fullName: app.fullName,
          email: app.email,
          unitId: app.unitId,
          unitNumber: app.unit?.unitNumber ?? null,
          propertyId: app.propertyId,
          propertyName: app.property?.name ?? null,
          createdAt: app.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cleaning up orphaned applications:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
