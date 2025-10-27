"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Import editor dynamically to prevent SSR errors
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const Markdown = dynamic(() => import("@uiw/react-markdown-preview"), { ssr: false });

interface Props {
  section?: any;
  policyId: number;
  onSaved: () => void;
  onClose: () => void;
}

export default function SectionForm({ section, policyId, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    title: section?.title || "",
    intro: section?.intro || "",
    content: section?.content || "",
  });

  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const method = section ? "PUT" : "POST";
    const url = section
      ? `/api/policysections/${section.id}`
      : `/api/policysections`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, policyId }),
    });

    onSaved();
    onClose();
  };

  return (
    <div className="p-4 bg-white rounded-md border space-y-4 shadow-sm">
      <h5 className="text-lg font-semibold text-gray-800">
        {section ? "✏️ Edit Section" : "➕ Add New Section"}
      </h5>

      <input
        name="title"
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
        placeholder="Section Title"
        className="w-full border p-2 rounded-md focus:ring focus:ring-green-200"
      />

      <input
        name="intro"
        value={form.intro}
        onChange={(e) => handleChange("intro", e.target.value)}
        placeholder="Short Introduction"
        className="w-full border p-2 rounded-md focus:ring focus:ring-green-200"
      />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">Section Content</label>
          <button
            onClick={() => setIsPreview(!isPreview)}
            type="button"
            className="text-sm text-green-700 border border-green-600 px-2 py-1 rounded hover:bg-green-50"
          >
            {isPreview ? "📝 Edit" : "👀 Preview"}
          </button>
        </div>

        {isPreview ? (
          <div
            data-color-mode="light"
            className="border p-3 rounded-md bg-gray-50 prose max-w-none"
          >
            <Markdown source={form.content} />
          </div>
        ) : (
          <MDEditor
            value={form.content}
            onChange={(value = "") => handleChange("content", value)}
            height={300}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onClose}
          className="px-3 py-1 border border-gray-400 text-gray-600 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
