import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MarketplaceClientPage } from '@/components/website/marketplace/ListingClientPage';
import Navbar from '@/components/website/Navbar';
import { marketplaceListings } from "@/app/data/marketplaceData";
import Loading from './loading';

export const metadata: Metadata = {
  title: 'Marketplace - Rentflow360',
  description: 'Explore Property Listings, Assets and Services on Rentflow 360 Marketplace.',
  keywords: 'marketplace, property listings, assets, services',
}

export default function MarketListingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto px-6">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6">
                                Marketplace <span className="text-gradient-primary">Listings</span>
                            </h1>
                            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                                Explore Property Listings, Assets and Services on Rentflow 360 Marketplace.
                            </p>
        
                           
                        </div>
        
      </section>
      <Suspense fallback={<Loading />}>
        <MarketplaceClientPage listings={marketplaceListings} />
      </Suspense>
    </div>
  );
}