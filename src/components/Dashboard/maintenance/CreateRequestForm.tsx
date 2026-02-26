"use client";

import { useEffect, useMemo, useState } from "react";
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
  city?: string | null;
  apartmentComplexDetail?: { buildingName?: string | null } | null;
  houseDetail?: { houseName?: string | null } | null;
  units?: Unit[];
};

function getPropertyDisplayName(p?: Property | null): string {
  return (
    p?.apartmentComplexDetail?.buildingName ||
    p?.houseDetail?.houseName ||
    p?.name ||
    p?.address ||
    p?.city ||
    p?.id ||
    "-"
  );
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

  const orgId = useMemo(() => organizationId ?? user?.organization?.id ?? "", [organizationId, user]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [category, setCategory] = useState("STANDARD");

  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load properties for org
  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      if (!orgId) {
        setProperties([]);
        setPropertyId("");
        return;
      }

      try {
        const res = await fetch(`/api/properties?organizationId=${encodeURIComponent(orgId)}`);
        if (!res.ok) throw new Error("Failed to load properties");

        const data = (await res.json()) as Property[];
        if (cancelled) return;

        const list = Array.isArray(data) ? data : [];
        setProperties(list);

        // Default property selection
        if (list.length > 0) setPropertyId((prev) => prev || list[0].id);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setProperties([]);
          setPropertyId("");
        }
      }
    }

    loadProperties();
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  // Load units for selected property
  useEffect(() => {
    let cancelled = false;

    async function loadUnits() {
      if (!orgId || !propertyId) {
        setUnits([]);
        setUnitId("");
        return;
      }

      try {
        const res = await fetch(
          `/api/units?organizationId=${encodeURIComponent(orgId)}&propertyId=${encodeURIComponent(propertyId)}`
        );
        if (!res.ok) throw new Error("Failed to load units");

        const data = (await res.json()) as Unit[];
        if (cancelled) return;

        const list = Array.isArray(data) ? data.filter((u) => u?.id) : [];
        setUnits(list);

        // Default unit selection
        setUnitId((prev) => prev || (list[0]?.id ?? ""));
      } catch (e) {
        console.error("Error loading units:", e);
        if (!cancelled) {
          setUnits([]);
          setUnitId("");
        }
      }
    }

    // Reset unit when property changes
    setUnitId("");
    loadUnits();

    return () => {
      cancelled = true;
    };
  }, [orgId, propertyId]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("STANDARD");
    setPriority("NORMAL");
    setError(null);
    // keep propertyId as current selection; keep unit selection based on property
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!orgId) {
      setError("Organization not found. Please re-login.");
      return;
    }

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
      const payload = {
        organizationId: orgId,
        propertyId,
        unitId,
        userId: user.id,
        title,
        description,
        priority,
        category,
      };

      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create request");
      }

      resetForm();
      onSuccess?.();
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const propertyName = properties.find((p) => p.id === propertyId)?.name || "";

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-white rounded shadow max-w-2xl mx-auto">
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
            <option key={p.id} value={p.id}>
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
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {propertyName ? `${propertyName} · ` : ""}
              {u.unitName || `Unit ${u.unitNumber}`}
            </option>
          ))}
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
            resetForm();
            setPropertyId(properties?.[0]?.id ?? "");
            onSuccess?.();
          }}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
