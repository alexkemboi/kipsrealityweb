"use client";
import { useState, useEffect } from "react";

interface Feature { id?: number; title: string; description: string; }
interface Props { feature?: Feature | null; planId: number; onSaved: () => void; }

export default function FeatureForm({ feature, planId, onSaved }: Props) {
  const [form, setForm] = useState<Feature>({ title: "", description: "" });

  useEffect(() => { if (feature) setForm(feature); }, [feature]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = feature?.id ? "PUT" : "POST";
    const url = feature?.id ? `/api/feature/${feature.id}` : "/api/feature";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, planId }),
    });
    setForm({ title: "", description: "" });
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-300 p-3 rounded-md mt-2">
      <input name="title" value={form.title} onChange={handleChange} placeholder="Feature Title" className="w-full border border-gray-300 rounded-md px-2 py-1 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Feature Description" className="w-full border border-gray-300 rounded-md px-2 py-1 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
      <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm">{feature?.id ? "Update" : "Create"} Feature</button>
    </form>
  );
}
