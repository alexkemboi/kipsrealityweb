//src/components/Dashboard/SystemadminDash/PricingCrud/PlanForm.tsx
"use client";
import { useState, useEffect } from "react";

interface Plan {
  id?: number;
  name: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description?: string;
  gradient?: string;
}

interface Props {
  plan?: Plan | null;
  onSaved: () => void;
}

export default function PlanForm({ plan, onSaved }: Props) {
  const [form, setForm] = useState<Plan>({
    name: "",
    badge: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "",
    gradient: "",
  });

  useEffect(() => {
    if (plan) setForm(plan);
  }, [plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = plan?.id ? "PUT" : "POST";
    const url = plan?.id ? `/api/plan/${plan.id}` : "/api/plan";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", badge: "", monthlyPrice: 0, yearlyPrice: 0, description: "", gradient: "" });
    onSaved();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-200"
    >
      <h2 className="text-lg font-semibold mb-4">{plan?.id ? "Edit Plan" : "Create Plan"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Plan Name"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          name="badge"
          value={form.badge}
          onChange={handleChange}
          placeholder="Badge (optional)"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="number"
          name="monthlyPrice"
          value={form.monthlyPrice}
          onChange={handleChange}
          placeholder="Monthly Price"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="number"
          name="yearlyPrice"
          value={form.yearlyPrice}
          onChange={handleChange}
          placeholder="Yearly Price"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="col-span-1 md:col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          name="gradient"
          value={form.gradient}
          onChange={handleChange}
          placeholder="Gradient (e.g. from-blue-500 to-teal-500)"
          className="col-span-1 md:col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Gradient Preview */}
      {form.gradient && (
        <div
          className={`mt-4 h-16 w-full rounded-md`}
          style={{ background: `linear-gradient(${form.gradient})` }}
        ></div>
      )}

      <button
        type="submit"
        className="mt-4 w-full bg-green-500 hover:bg-green-500 text-white px-4 py-2 rounded-md font-semibold transition"
      >
        {plan?.id ? "Update Plan" : "Create Plan"}
      </button>
    </form>
  );
}
