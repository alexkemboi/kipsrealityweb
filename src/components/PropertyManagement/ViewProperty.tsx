"use client";

import Link from "next/link";
import Image from "next/image";

interface Property {
  id: string;
  listingId: string;
  organizationId: string;
  city: string;
  address: string;
  totalUnits: number;           // total apartments or rooms in this property
  occupiedUnits: number;        // currently occupied units
  monthlyRent: number;          // average or total monthly rent
  maintenanceRequests: number;  // active maintenance tickets
  revenueThisMonth: number;     // income generated this month
  availabilityStatus: string;   // e.g., Fully Occupied, Partially Occupied, Vacant
  image: string;
  createdAt?: string;
}

export default function PropertyCards() {
  const properties: Property[] = [
    {
      id: "prop-001",
      listingId: "list-001",
      organizationId: "org-001",
      city: "Nairobi",
      address: "Kileleshwa Heights Apartments",
      totalUnits: 20,
      occupiedUnits: 18,
      monthlyRent: 95000,
      maintenanceRequests: 2,
      revenueThisMonth: 1620000,
      availabilityStatus: "Partially Occupied",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&auto=format&fit=crop",
    },
    {
      id: "prop-002",
      listingId: "list-002",
      organizationId: "org-001",
      city: "Mombasa",
      address: "Seaview Luxury Condos",
      totalUnits: 12,
      occupiedUnits: 12,
      monthlyRent: 120000,
      maintenanceRequests: 0,
      revenueThisMonth: 1440000,
      availabilityStatus: "Fully Occupied",
      image:
        "https://images.unsplash.com/photo-1657483939551-23e636826c7b?w=600&q=80&auto=format&fit=crop",
    },
    {
      id: "prop-003",
      listingId: "list-003",
      organizationId: "org-001",
      city: "Kisumu",
      address: "Sunset Villas Estate",
      totalUnits: 15,
      occupiedUnits: 10,
      monthlyRent: 80000,
      maintenanceRequests: 3,
      revenueThisMonth: 800000,
      availabilityStatus: "Vacancies Available",
      image:
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80&auto=format&fit=crop",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property) => (
        <Link
          key={property.id}
          href={`view-property/${property.id}`}
          className="group"
        >
          <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {/* Property Image */}
            <div className="relative w-full h-48">
              <Image
                src={property.image}
                alt={property.address}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Property Details */}
            <div className="p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {property.address}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{property.city}</p>

              <div className="mt-3 text-sm text-gray-700 space-y-1">
                <p>
                  <strong>{property.occupiedUnits}</strong> / {property.totalUnits} Units Occupied
                </p>
                <p>
                  <strong>$ {property.monthlyRent.toLocaleString()}</strong> Monthly Rent
                </p>
                <p>{property.maintenanceRequests} Active Maintenance Requests</p>
                <p className="text-navy-700 font-semibold">
                  Revenue: $ {property.revenueThisMonth.toLocaleString()}
                </p>
              </div>

              <p
                className={`text-xs mt-3 font-medium ${property.availabilityStatus === "Fully Occupied"
                    ? "text-navy-700"
                    : property.availabilityStatus === "Partially Occupied"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
              >
                {property.availabilityStatus}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
