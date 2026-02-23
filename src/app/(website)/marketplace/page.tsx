import type { Metadata } from "next";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import { prisma } from "@/lib/db";
import { MarketplaceClientPage } from "@/components/website/marketplace/ListingClientPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketplace Listings | Rentflow 360",
  description:
    "Explore property listings, assets, and services on the Rentflow 360 Marketplace.",
};

interface MarketplaceItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  location: string;
  unitId?: string;
  propertyId: string;
  unit?: {
    id: string;
    unitNumber?: string;
    property: {
      id: string;
      name?: string;
    };
  };
  property: {
    id: string;
    name?: string;
  };
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";

function toSafeNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function isMarketplaceItem(item: MarketplaceItem | null): item is MarketplaceItem {
  return item !== null;
}

export default async function MarketplacePage() {
  let listings: MarketplaceItem[] = [];
  let hasError = false;

  try {
    const listingsData = await prisma.listing.findMany({
      where: {
        AND: [
          {
            OR: [{ unit: { isNot: null } }, { property: { isNot: null } }],
          },
          {
            OR: [
              // ✅ safer Prisma relation filter syntax for optional relation
              { status: { is: { name: { in: ["ACTIVE", "COMING_SOON"] } } } },
              { statusId: null },
            ],
          },
        ],
      },
      include: {
        images: true,
        status: true,
        unit: {
          include: {
            property: {
              include: {
                location: true,
                propertyType: true,
              },
            },
          },
        },
        property: {
          include: {
            location: true,
            propertyType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedListings = listingsData
      .map((listing): MarketplaceItem | null => {
        const isUnitListing = Boolean(listing.unitId);

        // Unit listing -> use unit.property
        // Property listing -> use property directly
        const property = isUnitListing ? listing.unit?.property : listing.property;

        if (!property) return null;

        const unitId = isUnitListing ? listing.unitId ?? undefined : undefined;
        const unitNumber = isUnitListing ? listing.unit?.unitNumber ?? undefined : undefined;

        const title =
          typeof listing.title === "string" && listing.title.trim()
            ? listing.title
            : "Untitled Listing";

        const description =
          typeof listing.description === "string" && listing.description.trim()
            ? listing.description
            : property.amenities || "No description available";

        const location =
          property.city ||
          property.location?.name ||
          "Unknown Location";

        const image =
          listing.images?.[0]?.imageUrl || FALLBACK_IMAGE;

        const category =
          property.propertyType?.name ||
          (isUnitListing ? "Unit" : "Property");

        return {
          id: listing.id,
          title,
          description,
          price: toSafeNumber(listing.price),
          image,
          category,
          location,
          unitId,
          propertyId: property.id,
          unit: unitId
            ? {
                id: unitId,
                unitNumber,
                property: {
                  id: property.id,
                  name: property.name ?? undefined,
                },
              }
            : undefined,
          property: {
            id: property.id,
            name: property.name ?? undefined,
          },
        };
      })
      .filter(isMarketplaceItem);

    listings = mappedListings;
  } catch (error) {
    hasError = true;
    console.error("Error fetching marketplace listings:", error);
  }

  return (
    <>
      <Navbar />

      <section className="flex w-full flex-col items-center justify-center bg-[#18181a] py-32 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">
            Marketplace <span className="text-gradient-primary">Listings</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
            Explore Property Listings, Assets, and Services on Rentflow 360 Marketplace.
          </p>

          {hasError ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-2 text-2xl font-bold text-white">
                Unable to load listings
              </h2>
              <p className="text-white/80">
                Please try again later or contact support if the problem persists.
              </p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-2 text-2xl font-bold text-white">
                No listings found
              </h2>
              <p className="text-white/80">
                Check back soon for new marketplace listings.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <MarketplaceClientPage listings={listings} />
      <Footer />
    </>
  );
}
