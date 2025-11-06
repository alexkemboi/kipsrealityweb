"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useAuth } from "@/context/AuthContext";

type Property = { id: string; address: string | null; city: string | null };

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
  const [properties, setProperties] = useState<Property[]>([]);
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !description || !propertyId) {
      setError("Please fill all fields");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a request");
      return;
    }

    setLoading(true);

    try {
      // Use the real database API
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organizationId ?? user.organization?.id,
          propertyId,
          userId: user.id,
          title,
          description,
        }),
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
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 p-4 bg-[#0a1628] rounded shadow"
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
              {p.address ?? p.id} {p.city ? `— ${p.city}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="mt-1 block w-full bg-[#15386a]/30 border border-[#15386a] text-white placeholder-gray-500 p-3 rounded-lg disabled:opacity-60"
          placeholder="Leaky faucet"
        />
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
          }}
          className="px-4 py-2 bg-transparent border border-[#15386a] text-white rounded-lg"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
