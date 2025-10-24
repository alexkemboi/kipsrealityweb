
import React from "react";
import {MarketplaceItem, marketplaceListings}  from "@/app/data/marketplaceData"
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
   
      return <IndividualListingClient listing={listing} />;

  }
}
