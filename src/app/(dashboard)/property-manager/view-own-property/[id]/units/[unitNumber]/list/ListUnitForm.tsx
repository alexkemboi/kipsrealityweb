"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchUnitDetails } from "@/lib/units";

export default function ListUnitForm({ propertyId, unitNumber }: { propertyId: string; unitNumber: string }) {
  const router = useRouter();
  const { user } = useAuth();

  const [unit, setUnit] = useState<any>(null);
  const [unitId, setUnitId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await fetchUnitDetails(propertyId, unitNumber, false);

      setUnit(data);
      setUnitId(data?.id ?? null);

      if (data) {
        setTitle(`Unit ${unitNumber} for Rent`);
        setDescription(
          `${data.bedrooms ?? ""} Bedroom, ${data.bathrooms ?? ""} Bathroom unit.`
        );
        setPrice(data.rentAmount ?? "");
      }
    };

    load();
  }, [propertyId, unitNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return alert("Not logged in");

    setLoading(true);

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: user.organization?.id,
        createdBy: user.id,
        categoryId: "housing",
        propertyId,
        unitId,
        title,
        description,
        price: Number(price),
      }),
    });

    if (res.ok) {
      router.push(`/property-manager/view-own-property/${propertyId}/units`);
    } else {
      alert("Failed to create listing");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mt-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4m0 4h4" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">List Unit {unitNumber}</h2>
        <p className="text-gray-600">Create a new listing for this unit</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter listing title"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none resize-none min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the unit features and amenities"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rent</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.valueAsNumber || "")}
              required
              placeholder="0.00"
              min="0"
            />
          </div>
        </div>

        <button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Listing...
            </div>
          ) : (
            "List Unit"
          )}
        </button>
      </form>
    </div>
  );
}