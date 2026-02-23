import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { ListingStatus } from "@/lib/listing-types";

async function ensureStatusId(status: ListingStatus): Promise<string> {
  const existing = await prisma.listingStatus.findFirst({
    where: { name: { equals: status } },
    select: { id: true },
  });

  if (existing?.id) return existing.id;

  const created = await prisma.listingStatus.create({
    data: { name: status },
    select: { id: true },
  });

  return created.id;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "PROPERTY_MANAGER"] as const;
    if (!allowedRoles.includes(user.role as (typeof allowedRoles)[number])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [activeStatusId, comingSoonStatusId] = await Promise.all([
      ensureStatusId(ListingStatus.ACTIVE),
      ensureStatusId(ListingStatus.COMING_SOON),
    ]);

    const now = new Date();
    const orgFilter = user.organizationId
      ? { organizationId: user.organizationId }
      : {};

    // Base constraints for records eligible for backfill
    const baseFilters = [
      { statusId: null },
      {
        OR: [{ unitId: { not: null } }, { propertyId: { not: null } }],
      },
      orgFilter,
    ];

    // availabilityDate in the future => COMING_SOON
    const comingSoonResult = await prisma.listing.updateMany({
      where: {
        AND: [
          ...baseFilters,
          { availabilityDate: { gt: now } },
        ],
      },
      data: { statusId: comingSoonStatusId },
    });

    // availabilityDate null or <= now => ACTIVE
    const activeResult = await prisma.listing.updateMany({
      where: {
        AND: [
          ...baseFilters,
          {
            OR: [
              { availabilityDate: null },
              { availabilityDate: { lte: now } },
            ],
          },
        ],
      },
      data: { statusId: activeStatusId },
    });

    return NextResponse.json(
      {
        success: true,
        updated: {
          active: activeResult.count,
          comingSoon: comingSoonResult.count,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/listings/status/backfill]", error);
    return NextResponse.json(
      { error: "Failed to update listing statuses." },
      { status: 500 }
    );
  }
}
