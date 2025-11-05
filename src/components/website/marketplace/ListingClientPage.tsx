// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { Search, MapPin, Grid, X } from "lucide-react";
// import { MarketplaceItem } from "@/app/data/marketplaceData";
// import ApplyModal from "./ApplyModal";

// interface MarketplaceClientPageProps {
//   listings: MarketplaceItem[];
// }

// export function MarketplaceClientPage({ listings }: MarketplaceClientPageProps) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterCategory, setFilterCategory] = useState("all");
//   const [filterLocation, setFilterLocation] = useState("all");
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [selectedListing, setSelectedListing] = useState<number | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedProperty, setSelectedProperty] = useState<MarketplaceItem | null>(null);

//   const uniqueLocations = ["all", ...new Set(listings.map((item) => item.location))];
//   const uniqueCategories = ["all", ...new Set(listings.map((item) => item.category))];

//   const filteredListings = listings.filter((item) => {
//     const matchesSearch = selectedListing ? item.id === selectedListing : true;
//     const matchesCategory = filterCategory === "all" || item.category === filterCategory;
//     const matchesLocation = filterLocation === "all" || item.location === filterLocation;
//     return matchesSearch && matchesCategory && matchesLocation;
//   });

//   const handleApply = (listing: MarketplaceItem) => {
//     setSelectedProperty(listing);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedProperty(null);
//   };

//   const handleSubmit = async (data: any) => {
//     console.log("Tenant application submitted:", data, "for property:", selectedProperty);
//     // You can add additional logic here like showing a success message
//     handleCloseModal();
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-16">
//       {/* Search + Filters Card */}
//       <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 mb-12 border border-gray-100">
//         <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
//           {/* Search Bar */}
//           <div className="relative w-full md:w-1/3">
//             <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search listings..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setShowSuggestions(e.target.value.length > 0);
//                 if (e.target.value === "") {
//                   setSelectedListing(null);
//                 }
//               }}
//               onFocus={() => setShowSuggestions(true)}
//               className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//             />
//             {searchTerm && (
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setSelectedListing(null);
//                   setShowSuggestions(false);
//                 }}
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             )}

//             {/* Auto-suggest dropdown */}
//             {showSuggestions && searchTerm && (
//               <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
//                 {listings
//                   .filter(
//                     (item) =>
//                       item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                       item.description.toLowerCase().includes(searchTerm.toLowerCase())
//                   )
//                   .slice(0, 5)
//                   .map((item) => (
//                     <div
//                       key={item.id}
//                       className="p-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3 border-b border-gray-100 last:border-0"
//                       onClick={() => {
//                         setSearchTerm(item.title);
//                         setSelectedListing(item.id);
//                         setShowSuggestions(false);
//                       }}
//                     >
//                       <div className="w-12 h-12 relative shrink-0">
//                         <Image
//                           src={item.image}
//                           alt={item.title}
//                           fill
//                           className="object-cover rounded-md"
//                         />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium text-gray-900 truncate">{item.title}</p>
//                         <p className="text-sm text-gray-500 truncate">{item.location}</p>
//                         <p className="text-sm text-blue-600">KES {item.price.toLocaleString()}</p>
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             )}
//           </div>

//           {/* Category Filter */}
//           <div className="relative w-full md:w-1/4">
//             <Grid className="absolute left-3 top-2.5 text-gray-400" size={18} />
//             <select
//               value={filterCategory}
//               onChange={(e) => setFilterCategory(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
//             >
//               {uniqueCategories.map((cat) => (
//                 <option key={cat} value={cat}>
//                   {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Location Filter */}
//           <div className="relative w-full md:w-1/4">
//             <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
//             <select
//               value={filterLocation}
//               onChange={(e) => setFilterLocation(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
//             >
//               {uniqueLocations.map((loc) => (
//                 <option key={loc} value={loc}>
//                   {loc === "all" ? "All Locations" : loc}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Listings */}
//       {filteredListings.length > 0 ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {filteredListings.map((item) => (
//             <div
//               key={item.id}
//               className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
//             >
//               <Image
//                 src={item.image}
//                 alt={item.title}
//                 width={400}
//                 height={300}
//                 className="object-cover w-full h-60"
//               />
//               <div className="p-5 space-y-2">
//                 <h3 className="font-semibold text-xl text-gray-900">{item.title}</h3>
//                 <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
//                 <div className="flex items-center justify-between mt-4">
//                   <span className="text-blue-600 font-semibold">
//                     KES {item.price.toLocaleString()}
//                   </span>
//                   <span className="text-sm text-gray-500">{item.location}</span>
//                 </div>

//                 <div className="mt-5">
//                   <button
//                     onClick={() => handleApply(item)}
//                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-all duration-200"
//                   >
//                     Apply for Property
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-center text-gray-500 mt-16">No listings found.</p>
//       )}

//       {/* Application Modal */}
//       {showModal && selectedProperty && (
//         <ApplyModal
//           open={showModal}
//           onClose={handleCloseModal}
//           onSubmit={handleSubmit}
//           property={{
//             id: String(selectedProperty.id),
//             title: selectedProperty.title,
//             location: selectedProperty.location,
//             price: selectedProperty.price,
//           }}
//         />
//       )}
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Grid, X } from "lucide-react";
import { MarketplaceItem } from "@/app/data/marketplaceData";
import ApplyModal from "./ApplyModal";

interface MarketplaceClientPageProps {
  listings: MarketplaceItem[];
}

export function MarketplaceClientPage({ listings: initialListings }: MarketplaceClientPageProps) {
  const [listings] = useState(initialListings);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<MarketplaceItem | null>(null);

  const uniqueLocations = ["all", ...new Set(listings.map((item) => item.location))];
  const uniqueCategories = ["all", ...new Set(listings.map((item) => item.category))];

  const filteredListings = listings.filter((item) => {
    const matchesSearch = selectedListing ? item.id === selectedListing : true;
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesLocation = filterLocation === "all" || item.location === filterLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleApply = (listing: MarketplaceItem) => {
    setSelectedProperty(listing);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  const handleSubmit = async (data: any) => {
    console.log("Tenant application submitted:", data, "for property:", selectedProperty);
    handleCloseModal();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Search + Filters */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-6 mb-12 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
                if (e.target.value === "") setSelectedListing(null);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedListing(null);
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative w-full md:w-1/4">
            <Grid className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="relative w-full md:w-1/4">
            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
            >
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "all" ? "All Locations" : loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Listings */}
      {filteredListings.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <Image src={item.image} alt={item.title} width={400} height={300} className="object-cover w-full h-60" />
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-xl text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-blue-600 font-semibold">
                    KES {item.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">{item.location}</span>
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => handleApply(item)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-all duration-200"
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
      {showModal && selectedProperty && (
        <ApplyModal
          open={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          property={{
            id: selectedProperty.id,
            title: selectedProperty.title,
            location: selectedProperty.location,
            price: selectedProperty.price,
          }}
        />
      )}
    </div>
  );
}
