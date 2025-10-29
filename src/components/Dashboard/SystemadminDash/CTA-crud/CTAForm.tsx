"use client";

import { useState, useEffect } from "react";
import { CTA } from "./CTAList";

interface Props {
  cta?: CTA | null;
  onSaved: () => void;
}

export default function CTAForm({ cta, onSaved }: Props) {
  const [form, setForm] = useState<CTA>({
    page: "",
    title: "",
    subtitle: "",
    buttonText: "",
    buttonUrl: "",
    gradient: "",
  });

  useEffect(() => {
    if (cta) setForm(cta);
  }, [cta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = cta?.id ? "PUT" : "POST";
    const url = cta?.id ? `/api/cta/${cta.id}` : "/api/cta";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ page: "", title: "", subtitle: "", buttonText: "", buttonUrl: "", gradient: "" });
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="page"
        value={form.page}
        onChange={handleChange}
        placeholder="Page (e.g. landing, pricing)"
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        required
      />
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="CTA Title"
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        required
      />
      <textarea
        name="subtitle"
        value={form.subtitle}
        onChange={handleChange}
        placeholder="CTA Subtitle"
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        required
      />
      <input
        name="buttonText"
        value={form.buttonText}
        onChange={handleChange}
        placeholder="Button Text"
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        required
      />
      <input
        name="buttonUrl"
        value={form.buttonUrl}
        onChange={handleChange}
        placeholder="Button URL"
        className="w-full border border-gray-300 rounded-md px-3 py-2"
        required
      />
      <input
        name="gradient"
        value={form.gradient}
        onChange={handleChange}
        placeholder="Gradient (e.g. from-blue-500 to-teal-500)"
        className="w-full border border-gray-300 rounded-md px-3 py-2"
      />
      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
      >
        {cta?.id ? "Update CTA" : "Create CTA"}
      </button>
    </form>
  );
}
