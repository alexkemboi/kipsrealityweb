"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {fetchUnitDetails} from "@/lib/units";

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
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">List Unit {unitNumber}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Price</label>
          <input
            type="number"
            className="w-full border rounded-md px-3 py-2"
            value={price}
            onChange={(e) => setPrice(e.target.valueAsNumber || "")}
            required
          />
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
          disabled={loading}
        >
          {loading ? "Listing..." : "List Unit"}
        </button>

      </form>
    </div>
  );
}
