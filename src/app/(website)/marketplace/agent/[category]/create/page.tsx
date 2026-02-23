import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import IndividualListingClient from "@/components/website/marketplace/IndividualListingClient";
import {
  marketplaceListings,
  type MarketplaceItem,
} from "@/app/data/marketplaceData";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getListingById(idParam: string): MarketplaceItem | undefined {
  const listingId = Number(idParam);

  if (!Number.isFinite(listingId) || listingId <= 0) {
    return undefined;
  }

  return marketplaceListings.find((item) => item.id === listingId);
}

export async function generateStaticParams() {
  return marketplaceListings.map((item) => ({
    id: String(item.id),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    return {
      title: "Listing Not Found | Kips Reality Marketplace",
      description: "The requested marketplace listing could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const safeDescription =
    typeof listing.description === "string" && listing.description.trim()
      ? listing.description.slice(0, 160)
      : `Marketplace listing posted by ${listing.postedBy}.`;

  return {
    title: `${listing.title} | Kips Reality Marketplace`,
    description: safeDescription,
    alternates: {
      canonical: `/marketplace/${listing.id}`,
    },
    openGraph: {
      title: `${listing.title} | Kips Reality Marketplace`,
      description: safeDescription,
      url: `/marketplace/${listing.id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${listing.title} | Kips Reality Marketplace`,
      description: safeDescription,
    },
  };
}

export default async function ListingDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    notFound();
  }

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

      <IndividualListingClient listing={listing} />

      <Footer />
    </div>
  );
}
