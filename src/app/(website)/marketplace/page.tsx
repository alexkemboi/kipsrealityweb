import { prisma } from "@/lib/db";
import { MarketplaceClientPage } from "@/components/website/marketplace/ListingClientPage";
import Navbar from "@/components/website/Navbar";

// Define the interface here to match what we're creating
interface MarketplaceItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  location: string;
  unitId: string;
  propertyId: string;
  unit: {
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

export default async function MarketplacePage() {
  let listings: MarketplaceItem[] = [];

  try {
    // Fetch listings with unitId
    const listingsData = await prisma.listing.findMany({
      where: {
        unitId: { not: null },
      },
      include: {
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Found ${listingsData.length} listings with unitId`);

    // Get all unique unitIds and propertyIds
    const unitIds = [...new Set(listingsData.map(l => l.unitId).filter(Boolean))] as string[];
    
    // Fetch all units with their properties in one query
    const units = await prisma.unit.findMany({
      where: {
        id: { in: unitIds },
      },
      include: {
        property: {
          include: {
            location: true,
            propertyType: true,
          },
        },
      },
    });

    console.log(`Found ${units.length} units for those listings`);

    // Create a map for quick lookup
    const unitMap = new Map(units.map(u => [u.id, u]));

    // Map listings to MarketplaceItems
    const mappedListings = listingsData
      .map((listing) => {
        if (!listing.unitId) {
          console.warn(`Listing ${listing.id} has no unitId, skipping`);
          return null;
        }

        const unit = unitMap.get(listing.unitId);
        
        if (!unit) {
          console.warn(`Listing ${listing.id} references unitId ${listing.unitId} but unit not found in database`);
          return null;
        }

        const property = unit.property;

        if (!property) {
          console.warn(`Unit ${unit.id} has no property relation`);
          return null;
        }

        return {
          id: listing.id,
          title: listing.title || "Untitled Listing",
          description: listing.description || property.amenities || "No description available",
          price: listing.price || 0,
          location: property.city || property.location?.name || "Unknown Location",
          image: listing.images?.[0]?.imageUrl || `https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop`,
          unitId: unit.id,
          propertyId: property.id,
          unit: {
            id: unit.id,
            unitNumber: unit.unitNumber || undefined,
            property: {
              id: property.id,
              name: property.name || undefined,
            },
          },
          property: {
            id: property.id,
            name: property.name || undefined,
          },
        };
      })
      .filter((item) => item !== null);
    
    listings = mappedListings as MarketplaceItem[];
    
    console.log(`Successfully mapped ${listings.length} marketplace items`);

  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
  }

  return (
    <>
      <Navbar />
      <section className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Marketplace <span className="text-gradient-primary">Listings</span>
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Explore Property Listings, Assets, and Services on Rentflow 360 Marketplace.
          </p>

          {listings.length === 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                No listings found
              </h2>
              <p className="text-white/80">
                Please try again later or contact support if the problem persists.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <MarketplaceClientPage listings={listings} />
    </>
  );
}