"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Property = { id: string; address: string | null; city: string | null };

export default function CreateRequestForm() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetch properties for the user's organization
    async function load() {
      if (!user?.organization?.id) return;
      try {
        const res = await fetch(`/api/properties?organizationId=${user.organization.id}`);
        if (!res.ok) throw new Error("Failed to load properties");
        const data = await res.json();
        setProperties(data || []);
        if (data?.[0]) setPropertyId(data[0].id);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [user]);

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
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: user.organization?.id, propertyId, userId: user.id, title, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to create");
      }
      // naive refresh
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-white rounded shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Property</label>
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="mt-1 block w-full border rounded p-2">
          <option value="">Select property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.address ?? p.id} {p.city ? `— ${p.city}` : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border rounded p-2" placeholder="Leaky faucet" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border rounded p-2" rows={4} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? "Creating..." : "Create Request"}
        </button>
      </div>
    </form>
  );
}
