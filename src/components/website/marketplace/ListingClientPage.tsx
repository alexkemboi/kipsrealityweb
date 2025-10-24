"use client";

import React from "react";
import {useState, useMemo} from "react";
import {ListingCard} from "./ListingCard";
import {MarketplaceItem} from "@/app/data/marketplaceData";

interface MarketplaceClientPageProps {
    listings: MarketplaceItem[];
}

export function MarketplaceClientPage( {listings}:MarketplaceClientPageProps) {
      const [selectedCategory, setSelectedCategory] = useState("All");


    return(
        <section className="container  mx-auto px-4 py-16" >
         
        {listings.length > 0 ? (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.map((item) => (
               <ListingCard
                key={item.id}
                image={item.image}
                title={item.title}
                description={item.description}
                category={item.category}
                link={`/marketplace/${item.id}`}
                metaLeft={`KES ${item.price.toLocaleString()}`}
                metaRight={item.location}
                badgeColor={
                  item.verified ? "bg-green-500/90" : "bg-yellow-500/90"
                }
                showArrow
              />
        )
    )}
    </div>
    ) : (
        <div className="text-center py-24">
            <p className="text-lg text-white/70">
              No listings available at the moment.
            </p>
          </div>
        )}

</section>
    )
}