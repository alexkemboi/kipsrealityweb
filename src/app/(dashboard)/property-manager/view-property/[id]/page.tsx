"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Property {
  id: string;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  isFurnished: boolean;
  availabilityStatus: string;
  amenities: string;
  tenants: number;
  rentPerMonth: number;
  occupancyRate: string;
  maintenanceRequests: number;
  image: string;
  analytics: {
    month: string;
    occupancy: number;
    rentCollected: number;
    maintenance: number;
  }[];
}

const properties: Property[] = [
  {
    id: "prop-001",
    address: "Modern Apartment in Nairobi",
    city: "Nairobi",
    bedrooms: 3,
    bathrooms: 2,
    size: 120.5,
    isFurnished: true,
    amenities: "Pool, Gym, Wi-Fi",
    availabilityStatus: "Available",
    tenants: 2,
    rentPerMonth: 75000,
    occupancyRate: "85%",
    maintenanceRequests: 1,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop",
    analytics: [
      { month: "Jun", occupancy: 80, rentCollected: 70000, maintenance: 1 },
      { month: "Jul", occupancy: 90, rentCollected: 75000, maintenance: 0 },
      { month: "Aug", occupancy: 85, rentCollected: 74000, maintenance: 2 },
      { month: "Sep", occupancy: 88, rentCollected: 76000, maintenance: 1 },
      { month: "Oct", occupancy: 92, rentCollected: 77000, maintenance: 0 },
    ],
  },
  {
    id: "prop-002",
    address: "Beachfront House in Mombasa",
    city: "Mombasa",
    bedrooms: 2,
    bathrooms: 1,
    size: 98.0,
    isFurnished: false,
    amenities: "Ocean View, Balcony",
    availabilityStatus: "Occupied",
    tenants: 3,
    rentPerMonth: 95000,
    occupancyRate: "100%",
    maintenanceRequests: 0,
    image: "https://images.unsplash.com/photo-1657483939551-23e636826c7b?w=800&q=80&auto=format&fit=crop",
    analytics: [
      { month: "Jun", occupancy: 100, rentCollected: 95000, maintenance: 0 },
      { month: "Jul", occupancy: 100, rentCollected: 95000, maintenance: 0 },
      { month: "Aug", occupancy: 95, rentCollected: 94000, maintenance: 1 },
      { month: "Sep", occupancy: 100, rentCollected: 95000, maintenance: 0 },
      { month: "Oct", occupancy: 100, rentCollected: 95000, maintenance: 0 },
    ],
  },
  {
    id: "prop-003",
    address: "Luxury Villa in Kisumu",
    city: "Kisumu",
    bedrooms: 4,
    bathrooms: 3,
    size: 250.0,
    isFurnished: true,
    amenities: "Garden, Garage, Wi-Fi",
    availabilityStatus: "Available",
    tenants: 1,
    rentPerMonth: 150000,
    occupancyRate: "70%",
    maintenanceRequests: 2,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop",
    analytics: [
      { month: "Jun", occupancy: 65, rentCollected: 120000, maintenance: 2 },
      { month: "Jul", occupancy: 70, rentCollected: 130000, maintenance: 1 },
      { month: "Aug", occupancy: 72, rentCollected: 135000, maintenance: 1 },
      { month: "Sep", occupancy: 68, rentCollected: 125000, maintenance: 3 },
      { month: "Oct", occupancy: 75, rentCollected: 140000, maintenance: 1 },
    ],
  },
];

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const property = properties.find((p) => p.id === id);

  if (!property) {
    return <p className="text-center text-gray-500 mt-10">Property not found.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-md mt-10">
      {/* Property Header */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden mb-8">
        <Image
          src={property.image}
          alt={property.address}
          fill
          className="object-cover"
        />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.address}</h1>
      <p className="text-gray-600 mb-6">{property.city}</p>

      {/* Summary Info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm text-gray-700 mb-8">
        <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
        <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
        <p><strong>Size:</strong> {property.size} m²</p>
        <p><strong>Furnished:</strong> {property.isFurnished ? "Yes" : "No"}</p>
        <p><strong>Status:</strong> {property.availabilityStatus}</p>
        <p><strong>Amenities:</strong> {property.amenities}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <h3 className="text-sm font-semibold text-blue-700">Tenants</h3>
          <p className="text-2xl font-bold text-blue-900">{property.tenants}</p>
        </div>
        <div className="bg-navy-50 rounded-xl p-4 text-center">
          <h3 className="text-sm font-semibold text-navy-900">Monthly Rent</h3>
          <p className="text-2xl font-bold text-green-900">KSh {property.rentPerMonth.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <h3 className="text-sm font-semibold text-yellow-700">Occupancy</h3>
          <p className="text-2xl font-bold text-yellow-900">{property.occupancyRate}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <h3 className="text-sm font-semibold text-red-700">Maintenance</h3>
          <p className="text-2xl font-bold text-red-900">{property.maintenanceRequests}</p>
        </div>
      </div>

      {/* Analytics Section */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Occupancy Trend */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h3 className="text-gray-700 font-semibold mb-3">Occupancy Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={property.analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="occupancy" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rent Collected Trend */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h3 className="text-gray-700 font-semibold mb-3">Rent Collection (KSh)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={property.analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rentCollected" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Maintenance Requests Trend */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-gray-700 font-semibold mb-3">Maintenance Requests</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={property.analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="maintenance" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Edit Property
        </button>
      </div>
    </div>
  );
}
