import type { Metadata } from 'next';
import { MarketplaceClientPage } from '@/components/website/marketplace/ListingClientPage';
import Navbar from '@/components/website/Navbar';
import {MyListings} from "@/components/website/marketplace/MyListings"
import { marketplaceListings } from "@/app/data/marketplaceData"


export const metadata: Metadata = {
  title: 'My Listings - Rentflow360',
  description: 'Manage your Property Listings, Assets and Services on Rentflow 360 Marketplace.',
  keywords: 'marketplace, property listings, assets, services',
}

export default function MyListingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="w-full bg-[#18181a] text-white py-32 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl mx-auto px-6">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6">
                                My <span className="text-gradient-primary">Listings</span>
                            </h1>
                            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                                Manage your Property Listings, Assets and Services on Rentflow 360 Marketplace.
                            </p>
        
                           
                        </div>
        
      </section>
      <MyListings listings={marketplaceListings} />
    </div>
  );
}