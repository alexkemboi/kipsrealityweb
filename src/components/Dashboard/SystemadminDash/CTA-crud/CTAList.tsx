"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import CTAForm from "./CTAForm";
import CTAItem from "./CTAItem";

export interface CTA {
  id?: number;
  page: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  gradient: string;
}

export default function CTAList() {
  const [ctas, setCtas] = useState<CTA[]>([]);
  const [editingCTA, setEditingCTA] = useState<CTA | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCTAs = async () => {
    try {
      const res = await fetch("/api/cta");
      const data = await res.json();
      setCtas(data);
    } catch {
      toast.error("Failed to fetch CTAs");
    }
  };

  const deleteCTA = async (id: number) => {
    if (!confirm("Are you sure you want to delete this CTA?")) return;
    try {
      await fetch(`/api/cta/${id}`, { method: "DELETE" });
      toast.success("CTA deleted successfully");
      fetchCTAs();
    } catch {
      toast.error("Failed to delete CTA");
    }
  };

  useEffect(() => {
    fetchCTAs();
  }, []);

  return (
    <div className="p-4">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">CTA Management</h1>
        <button
          className="bg-green-500 hover:bg-green-500 text-white px-4 py-2 rounded-md"
          onClick={() => { setEditingCTA(null); setShowForm(true); }}
        >
          + Add CTA
        </button>
      </div>

      {/* CTA Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
            <CTAForm
              cta={editingCTA}
              onSaved={() => { setShowForm(false); fetchCTAs(); }}
            />
          </div>
        </div>
      )}

      {/* CTA List */}
      <ul className="space-y-3">
        {ctas.map((cta) => (
          <CTAItem
            key={cta.id}
            cta={cta}
            onEdit={(c) => { setEditingCTA(c); setShowForm(true); }}
            onDelete={deleteCTA}
          />
        ))}
      </ul>
    </div>
  );
}
