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
    <form onSubmit={handleSubmit} className="space-y-3 px-6 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="page"
          value={form.page}
          onChange={handleChange}
          placeholder="Page (e.g. landing)"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          name="buttonText"
          value={form.buttonText}
          onChange={handleChange}
          placeholder="Button Text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="CTA Title"
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        required
      />

      <textarea
        name="subtitle"
        value={form.subtitle}
        onChange={handleChange}
        placeholder="CTA Subtitle"
        rows={2}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="buttonUrl"
          value={form.buttonUrl}
          onChange={handleChange}
          placeholder="Button URL"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          name="gradient"
          value={form.gradient}
          onChange={handleChange}
          placeholder="Gradient (optional)"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-500 active:bg-green-700 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
      >
        {cta?.id ? "Update CTA" : "Create CTA"}
      </button>
    </form>
  );
}