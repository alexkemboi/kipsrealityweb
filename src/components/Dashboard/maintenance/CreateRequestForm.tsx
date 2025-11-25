"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useAuth } from "@/context/AuthContext";

type Unit = {
  id: string;
  unitNumber: string;
  unitName?: string | null;
};

type Property = {
  id: string;
  name: string | null;
  address: string | null;
  units: Unit[];
};

// Helper to get property display name
function getPropertyDisplayName(property: any): string {
  return property?.apartmentComplexDetail?.buildingName || property?.houseDetail?.houseName || property?.name || property?.address || property?.city || property?.id || '-';
}

export default function CreateRequestForm({
  organizationId,
  onSuccess,
}: {
  organizationId?: string;
  onSuccess?: () => void;
}): ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [category, setCategory] = useState("STANDARD");
  const [properties, setProperties] = useState<Property[]>([]);
  const [unitId, setUnitId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    async function load() {
      const orgId = organizationId ?? user?.organization?.id;
      if (!orgId) {
        setProperties([]);
        return;
      }
      try {
        const res = await fetch(`/api/properties?organizationId=${encodeURIComponent(orgId)}`);
        if (!res.ok) console.error("Failed to load properties");
        const data = await res.json();
        setProperties(data || []);
        if (data?.[0]) setPropertyId(data[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [user, organizationId]);

  useEffect(() => {
    async function loadUnits() {
      if (!propertyId || !organizationId) return;
      try {
        const res = await fetch(`/api/units?organizationId=${organizationId}&propertyId=${propertyId}`);
        if (!res.ok) throw new Error("Failed to load units");
        const data = await res.json();
        const realUnits = (data || []).filter((u: any) => u && u.id);
        setUnits(realUnits);
        if (realUnits?.[0]) setUnitId(realUnits[0].id);
      } catch (err) {
        console.error("Error loading units:", err);
      }
    }
    setUnitId("");
    loadUnits();
  }, [propertyId, organizationId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !propertyId || !unitId) {
      setError("Please fill all fields including property and unit");
      return;
    }

    if (title.length > 20) {
      setError("Title must be less than 20 characters");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a request");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        organizationId: organizationId ?? user.organization?.id,
        propertyId,
        unitId,
        userId: user.id,
        title,
        description,
      };
      if (priority) payload.priority = priority;
      if (category) payload.category = category;

      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to create");
      }

      setTitle("");
      setDescription("");
      setPropertyId(properties[0]?.id ?? "");
      setCategory("STANDARD");
      if (onSuccess) onSuccess();
      router.refresh(); // This triggers loading.tsx for the current route
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 p-4 bg-white rounded shadow max-w-2xl mx-auto"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Property</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-lg disabled:opacity-60"
        >
          <option value="">Select property</option>
          {properties.map((p) => (
            <option key={p.id ?? ""} value={p.id ?? ""}>
              {getPropertyDisplayName(p)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Unit</label>
        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          disabled={loading || !propertyId}
          className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-lg disabled:opacity-60"
        >
          <option value="">Select unit</option>
          {units.map((unit) => {
            const propertyName = properties.find(p => p.id === propertyId)?.name || "";
            return (
              <option key={unit.id} value={unit.id}>
                {propertyName ? `${propertyName} · ` : ""}{unit.unitName || `Unit ${unit.unitNumber}`}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={20}
          disabled={loading}
          className="mt-1 block w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 p-3 rounded-lg disabled:opacity-60"
          placeholder="Leaky faucet (max 20 chars)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-lg disabled:opacity-60"
        >
          <option value="">Select priority</option>
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-lg disabled:opacity-60"
        >
          <option value="STANDARD">Standard</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="URGENT">Urgent</option>
          <option value="ROUTINE">Routine</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 p-3 rounded-lg disabled:opacity-60"
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Request"}
        </button>
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setDescription("");
            setPropertyId(properties?.[0]?.id ?? "");
            setCategory("STANDARD");
            setError(null);
            if (onSuccess) onSuccess();
          }}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
