import * as React from "react";
import { prisma } from "@/lib/db";
import { requireAgent } from "@/lib/auth/requireAgent";
import MyListingsClient, { ListingItem, ListingStatus as UIListingStatus } from "./MyListingsClient";

export const dynamic = "force-dynamic";

/**
 * Maps DB status name to UI status type.
 */
function mapStatus(statusName?: string): UIListingStatus {
  if (!statusName) return "draft";
  const normalized = statusName.toLowerCase();

  if (normalized.includes("active") || normalized.includes("published")) return "published";
  if (normalized.includes("pending")) return "pending";
  if (normalized.includes("archive")) return "archived";
  if (normalized.includes("reject")) return "rejected";

  return "draft";
}

export default async function MyListingsPage() {
  const user = await requireAgent();

  const dbListings = await prisma.listing.findMany({
    where: {
      createdBy: user.id,
      organizationId: user.organizationId,
    },
    include: {
      status: true,
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      location: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const listings: ListingItem[] = dbListings.map((l) => ({
    id: l.id,
    title: l.title,
    category: "Real Estate", // Default category if not specified in DB
    status: mapStatus(l.status?.name),
    price: l.price,
    location: l.location?.name || undefined,
    thumbnailUrl: l.images[0]?.imageUrl || null,
    updatedAt: l.updatedAt.toISOString(),
    createdAt: l.createdAt.toISOString(),
    // Add other fields as needed
    views: 0, // Placeholder
    inquiries: 0, // Placeholder
  }));

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <MyListingsClient listings={listings} />
    </div>
  );
}
