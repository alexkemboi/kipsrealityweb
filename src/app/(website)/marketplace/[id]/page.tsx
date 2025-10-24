
import React from "react";
import {MarketplaceItem, marketplaceListings}  from "@/app/data/marketplaceData";
import Navbar from '@/components/website/Navbar';
import IndividualListingClient from "@/components/website/marketplace/IndividualListingClient";



interface PageProps {
  params:{ id: string };
}
export default function ListingDetailsPage({params}: PageProps) {
   
const listingId = Number(params.id)
const listing: MarketplaceItem | undefined = marketplaceListings.find(
    (item) => item.id === listingId
  );

   
    
if (!listing) {
    <div className="min-h-screen flex items-center justify-center bg-background">
      <h1 className="text-3xl font-bold text-gray-700">Listing Not Found</h1>
    </div>
} else {
   
      return (
      <div className="min-h-screen bg-background">
          <Navbar />
      
      <section className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto px-6">
                            <h1 className="text-5xl md:text-6xl text-gradient-primary font-bold mb-6">
                                Marketplace {listing.title}
                            </h1>
                            <p className="text-white/80 text-2xl font-semibold mb-8 max-w-2xl mx-auto">
                               Posted by: {listing.postedBy}
                            </p>
        
                           
                        </div>
        
      </section>
      <IndividualListingClient listing={listing} />;
</div>
  
)
}
}
 