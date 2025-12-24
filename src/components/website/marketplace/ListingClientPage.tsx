"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Grid, X } from "lucide-react";
import ApplyModal from "./ApplyModal";

export interface MarketplaceItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  image: string;


  unitId?: string | null;
  propertyId?: string | null;
  unit?: {
    id: string;
    unitNumber?: string;
    property?: {
      id: string;
      name?: string;
    };
  } | null;
  property?: {
    id: string;
    name?: string;
  } | null;
}

interface MarketplaceClientPageProps {
  listings: MarketplaceItem[];
}

export function MarketplaceClientPage({ listings: initialListings }: MarketplaceClientPageProps) {
  const [listings] = useState(initialListings);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [selectedListing, setSelectedListing] = useState<MarketplaceItem | null>(null);
  const [showModal, setShowModal] = useState(false);




  const handleApply = (listing: MarketplaceItem) => {
    const unitId = listing.unitId ?? listing.unit?.id;
    const propertyId = listing.propertyId ?? listing.unit?.property?.id ?? listing.property?.id;

    if (!unitId || !propertyId) {
      alert("This listing doesn't have an associated unit or property. Please contact support.");
      return;
    }

    setSelectedListing({
      ...listing,
      unitId,
      propertyId,
      unit: listing.unit || { id: unitId, property: { id: propertyId, name: listing.property?.name || "" } },
      property: listing.property || { id: propertyId, name: listing.unit?.property?.name || "" },
    });

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedListing(null);
  };

  // ✅ FIXED: Just close the modal, the ApplyModal already handles submission
  const handleSubmit = (data: any) => {
    console.log("Application submitted successfully:", data);
    handleCloseModal();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Search + Filters */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 mb-12 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003b73] focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>




        </div>
      </div>

      {/* Listings */}
      {listings.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <Image src={item.image} alt={item.title} width={400} height={300} className="object-cover w-full h-60" />
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-xl text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[#003b73] font-semibold">USD {item.price.toLocaleString()}</span>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => handleApply(item)}
                    className="w-full bg-[#003b73] hover:bg-[#002b5b] text-white py-2.5 rounded-xl font-semibold transition-all duration-200"
                  >
                    Apply for Property
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-16">No listings found.</p>
      )}

      {/* Application Modal */}
      {showModal && selectedListing && (
        <ApplyModal open={true} onClose={handleCloseModal} onSubmit={handleSubmit} listing={selectedListing} />
      )}
    </div>
  );
}