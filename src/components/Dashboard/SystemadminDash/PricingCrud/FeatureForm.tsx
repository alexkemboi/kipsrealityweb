"use client";

import { useState, useEffect } from "react";

interface Feature {
  id?: number;
  title: string;
  description?: string;
  key?: string;
  path?: string;
  icon?: string;
  category?: string;
  isActive?: boolean;
}

interface Props {
  feature?: Feature | null;
  onSaved: () => void;
  planId?: number; 
}

export default function FeatureForm({ feature, planId, onSaved }: Props) {
  const [form, setForm] = useState<Feature>({
    title: "",
    description: "",
    key: "",
    path: "",
    icon: "",
    category: "",
    isActive: true,
  });

  useEffect(() => {
    if (feature) setForm(feature);
  }, [feature]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = feature?.id ? "PUT" : "POST";
    const url = feature?.id ? `/api/feature/${feature.id}` : "/api/feature";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, planId }), // backend will handle plan linkage
    });

    setForm({
      title: "",
      description: "",
      key: "",
      path: "",
      icon: "",
      category: "",
      isActive: true,
    });

    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-300 p-4 rounded-md bg-white shadow-sm">
      <h2 className="font-semibold mb-3 text-gray-800">
        {feature?.id ? "Edit Feature" : "Create Feature"}
      </h2>

      <div className="grid grid-cols-1 gap-3">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Feature Title"
          className="border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-400"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Feature Description"
          className="border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-400"
        />

        <input
          name="key"
          value={form.key || ""}
          onChange={handleChange}
          placeholder="Unique Key (optional)"
          className="border border-gray-300 rounded-md px-2 py-1"
        />

        <input
          name="path"
          value={form.path || ""}
          onChange={handleChange}
          placeholder="Path (e.g. /dashboard)"
          className="border border-gray-300 rounded-md px-2 py-1"
        />

        <input
          name="icon"
          value={form.icon || ""}
          onChange={handleChange}
          placeholder="Icon name (optional)"
          className="border border-gray-300 rounded-md px-2 py-1"
        />

        <input
          name="category"
          value={form.category || ""}
          onChange={handleChange}
          placeholder="Category (optional)"
          className="border border-gray-300 rounded-md px-2 py-1"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive ?? true}
            onChange={handleChange}
          />
          Active Feature
        </label>
      </div>

      <button
        type="submit"
        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md w-full"
      >
        {feature?.id ? "Update Feature" : "Create Feature"}
      </button>
    </form>
  );
}
