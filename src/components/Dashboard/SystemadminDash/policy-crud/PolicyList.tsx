"use client";
import { useEffect, useState } from "react";
import PolicyForm from "./PolicyForm";
import PolicyItem from "./PolicyItem";

export interface Section {
  id: number;
  title: string;
  intro?: string;
  content?: string;
}

export interface Policy {
  id: number;
  title: string;
  companyName: string;
  contactEmail: string;
  privacyEmail: string;
  website?: string;
  mailingAddress?: string;
  responseTime?: string;
  inactiveAccountThreshold?: string;
  sections: Section[];
}

export default function PolicyList() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  const fetchPolicies = async () => {
    const res = await fetch("/api/policies");
    const data = await res.json();
    setPolicies(data);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    await fetch(`/api/policies/${id}`, { method: "DELETE" });
    fetchPolicies();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Policies</h1>
        <button
          onClick={() => {
            setEditingPolicy(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
        >
          + New Policy
        </button>
      </div>

      {showForm && (
        <PolicyForm
          policy={editingPolicy}
          onClose={() => setShowForm(false)}
          onSaved={fetchPolicies}
        />
      )}

      {policies.map((policy) => (
        <PolicyItem
          key={policy.id}
          policy={policy}
          onDelete={() => handleDelete(policy.id)}
          onEdit={() => {
            setEditingPolicy(policy);
            setShowForm(true);
          }}
          refresh={fetchPolicies}
        />
      ))}
    </div>
  );
}
