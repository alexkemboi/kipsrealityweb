"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useAuth } from "@/context/AuthContext";

type Unit = {
  id: string;
  unitNumber: string;
  unitName?: string | null;
};

type Property = {
  id: string;
  address: string | null;
  name: string | null;
  units: Unit[];
};

export default function CreateRequestForm({
  organizationId,
  onSuccess,
}: {
  organizationId?: string;
  onSuccess?: () => void;
}): ReactElement {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyId, setPropertyId] = useState("");
  // Default priority to NORMAL so the form will send a valid enum value
  // and the database default is explicit when creating requests.
  const [priority, setPriority] = useState("NORMAL");
  const [properties, setProperties] = useState<Property[]>([]);
  const [unitId, setUnitId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load properties from API
    async function load() {
      const orgId = organizationId ?? user?.organization?.id;
      if (!orgId) {
        setProperties([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/properties?organizationId=${encodeURIComponent(orgId)}`
        );
        if (!res.ok) throw new Error("Failed to load properties");
        const data = await res.json();
        setProperties(data || []);
        if (data?.[0]) setPropertyId(data[0].id);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, [user, organizationId]);

  // Fetch units when property changes
  const [units, setUnits] = useState<Unit[]>([]);
  
  useEffect(() => {
    async function loadUnits() {
      if (!propertyId || !organizationId) return;
      
      try {
        const res = await fetch(`/api/units?organizationId=${organizationId}&propertyId=${propertyId}`);
        if (!res.ok) throw new Error('Failed to load units');
        const data = await res.json();
        setUnits(data || []);
        if (data?.[0]) setUnitId(data[0].id);
      } catch (err) {
        console.error('Error loading units:', err);
      }
    }
    
    setUnitId('');
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
      // Use the real database API
      // Build payload and only include priority if the user selected one
      const payload: any = {
        organizationId: organizationId ?? user.organization?.id,
        propertyId,
        unitId,
        userId: user.id,
        title,
        description,
      };

      if (priority) {
        // Ensure we send the enum value expected by Prisma (e.g. 'LOW', 'NORMAL')
        payload.priority = priority;
      }

      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to create");
      }

      // Clear form and notify parent
      setTitle("");
      setDescription("");
      setPropertyId(properties[0]?.id ?? "");
      if (onSuccess) onSuccess();
      // Reload the page to refresh the data
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 p-4 bg-[#0a1628] rounded shadow max-w-2xl mx-auto"
    >
      <div>
        <label className="block text-sm font-medium text-gray-300">Property</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full bg-[#0a1628] border border-[#15386a] text-white p-3 rounded-lg disabled:opacity-60"
        >
          <option value="">Select property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name ?? p.address ?? p.id}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Unit</label>
        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          disabled={loading || !propertyId}
          className="mt-1 block w-full bg-[#0a1628] border border-[#15386a] text-white p-3 rounded-lg disabled:opacity-60"
        >
          <option value="">Select unit</option>
          {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.unitName || `Unit ${unit.unitNumber}`}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={20}
          disabled={loading}
          className="mt-1 block w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg disabled:opacity-60"
          placeholder="Leaky faucet (max 20 chars)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full bg-[#0a1628] border border-[#15386a] text-white p-3 rounded-lg disabled:opacity-60"
        >
      <option value="">Select priority</option>
        <option value="LOW">Low</option>
        <option value="NORMAL">Normal</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>

        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg disabled:opacity-60"
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          disabled={loading}
          className="px-4 py-2 bg-[#30D5C8] text-[#0f172a] rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Request"}
        </button>
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setDescription("");
            setPropertyId(properties?.[0]?.id ?? "");
            setError(null);
            if (onSuccess) onSuccess();
          }}
        
          className="px-4 py-2 bg-transparent border border-[#15386a] text-white rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
