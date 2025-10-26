"use client";
import { useState } from "react";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    <div className="p-3 bg-gray-50 rounded-md border space-y-2">
      <h5 className="font-medium">
        {section ? "Edit Section" : "Add Section"}
      </h5>

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="w-full border p-2 rounded"
      />

      <input
        name="intro"
        value={form.intro}
        onChange={handleChange}
        placeholder="Intro"
        className="w-full border p-2 rounded"
      />

      <textarea
        name="content"
        value={form.content}
        onChange={handleChange}
        placeholder="Content (JSON or Text)"
        className="w-full border p-2 rounded"
      />

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-2 py-1 border rounded">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
