// import type { Metadata } from 'next';
// import { Suspense } from 'react';
// import { MarketplaceClientPage } from '@/components/website/marketplace/ListingClientPage';
// import Navbar from '@/components/website/Navbar';
// import { marketplaceListings } from "@/app/data/marketplaceData";
// import Loading from './loading';

// export const metadata: Metadata = {
//   title: 'Marketplace - Rentflow360',
//   description: 'Explore Property Listings, Assets and Services on Rentflow 360 Marketplace.',
//   keywords: 'marketplace, property listings, assets, services',
// }

// export default function MarketListingsPage() {
//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />
      
//       <section className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">
//         <div className="max-w-3xl mx-auto px-6">
//                             <h1 className="text-5xl md:text-6xl font-bold mb-6">
//                                 Marketplace <span className="text-gradient-primary">Listings</span>
//                             </h1>
//                             <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
//                                 Explore Property Listings, Assets and Services on Rentflow 360 Marketplace.
//                             </p>
        
                           
//                         </div>
        
//       </section>
//       <Suspense fallback={<Loading />}>
//         <MarketplaceClientPage listings={marketplaceListings} />
//       </Suspense>
//     </div>
//   );
// }
import { prisma } from "@/lib/db";
import { MarketplaceClientPage } from "@/components/website/marketplace/ListingClientPage";
import { MarketplaceItem } from "@/app/data/marketplaceData";
import Navbar from "@/components/website/Navbar";

export default async function MarketplacePage() {
  try {
    // Fetch available properties with related listing data
    const properties = await prisma.property.findMany({
      include: {
        listing: {
          include: {
            categoryMarketPlace: true,
            images: true,
          },
        },
        propertyType: true,
        location: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const listings: MarketplaceItem[] = properties
      .filter((p) => p.listing) // Only properties that actually have a listing
      .map((property) => {
        const imageUrl =
          property.listing?.images?.[0]?.imageUrl || "/placeholder-property.jpg";

        const locationName =
          property.city || property.location?.name || "Unknown Location";

        const categoryName =
          property.listing?.categoryMarketPlace?.name?.toLowerCase() || "property";

        return {
          id: property.id,
          title: property.listing?.title || `${locationName} Property`,
          description:
            property.listing?.description ||
            property.amenities ||
            "No description available",
          price: property.listing?.price || 0,
          location: locationName,
          category: categoryName as MarketplaceItem["category"],
          image: imageUrl,
          postedBy: property.listing?.createdBy || "Unknown",
          verified: true,
          datePosted: property.createdAt.toISOString(),
        };
      });

    return (
      <>
        <Navbar />

        {/* Hero / Section */}
        <section className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Marketplace <span className="text-gradient-primary">Listings</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Explore Property Listings, Assets, and Services on Rentflow 360 Marketplace.
            </p>
          </div>
        </section>

        {/* Marketplace Listings */}
        <MarketplaceClientPage listings={listings} />
      </>
    );
  } catch (error) {
    console.error("Error fetching marketplace properties:", error);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to load properties
            </h2>
            <p className="text-gray-600">
              Please try again later or contact support if the problem persists.
            </p>
          </div>
        </section>
      </>
    );
  }
}
