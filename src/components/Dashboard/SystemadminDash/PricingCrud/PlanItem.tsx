"use client";

import { useState } from "react";
import FeatureForm from "./FeatureForm";
import FeatureItem from "./FeatureItem";
import toast from "react-hot-toast";

interface Feature { id: number; title: string; description: string; }

interface Plan {
  id: number;
  name: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description?: string;
  gradient?: string;
  features: Feature[];
}

interface Props {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (id: number) => void;
  refreshPlans: () => void;
}

export default function PlanItem({ plan, onEdit, onDelete, refreshPlans }: Props) {
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [showFeatureForm, setShowFeatureForm] = useState(false);

  // DELETE a feature
  const deleteFeature = async (id: number) => {
    if (!confirm("Delete this feature?")) return;
    try {
      await fetch(`/api/feature/${id}`, { method: "DELETE" });
      toast.success("Feature deleted successfully");
      refreshPlans();
    } catch {
      toast.error("Failed to delete feature");
    }
  };

  return (
    <li className="bg-white shadow-md rounded-xl p-6 mb-4 border border-gray-200 hover:shadow-lg transition duration-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">{plan.name}</h3>
        {plan.badge && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
            {plan.badge}
          </span>
        )}
      </div>

      {plan.description && <p className="text-gray-600 mb-2">{plan.description}</p>}
      <p className="font-bold mb-2">${plan.monthlyPrice}/month • ${plan.yearlyPrice}/year</p>

      {/* Features Section */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Features</h4>
        {plan.features.length > 0 ? (
          <ul>
            {plan.features.map((f) => (
            <FeatureItem
                key={f.id}
                feature={f}
                onEdit={(feature) => {
                setEditingFeature(feature);  // set feature to edit
                setShowFeatureForm(true);    // OPEN the modal
                }}
                onDelete={deleteFeature}
            />
            ))}

          </ul>
        ) : (
          <p className="text-gray-500 text-sm mb-2">No features yet.</p>
        )}

        {/* Add Feature button */}
        <button
          className="mt-2 text-blue-500 hover:underline"
          onClick={() => {
            setEditingFeature(null);  // reset for creating
            setShowFeatureForm(true);  // open modal
          }}
        >
          Add Feature
        </button>

        {/* Feature Modal */}
        {showFeatureForm && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-40">
            <div className="bg-white p-4 rounded-xl w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setShowFeatureForm(false)}
              >
                ✕
              </button>
              <FeatureForm
                feature={editingFeature}
                planId={plan.id}
                onSaved={() => {
                  setShowFeatureForm(false);
                  refreshPlans();
                  toast.success(
                    `${editingFeature ? "Feature updated" : "Feature created"} successfully`
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Plan Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(plan)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
        >
          Edit Plan
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
        >
          Delete Plan
        </button>
      </div>
    </li>
  );
}
