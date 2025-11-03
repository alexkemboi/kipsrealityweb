//src/components/Dashboard/SystemadminDash/PricingCrud/PlanList.tsx
"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import PlanItem from "./PlanItem";
import PlanForm from "./PlanForm";

export default function PlansList() {
  const [plans, setPlans] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

 const fetchPlans = async () => {
  try {
    const res = await fetch("/api/plan");
    const data = await res.json();
    
    const plansWithFeatures = data.map((plan: any) => ({
      ...plan,
      features: plan.features || [],
    }));

    setPlans(plansWithFeatures);
  } catch {
    toast.error("Failed to fetch plans");
  }
};


  const deletePlan = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await fetch(`/api/plan/${id}`, { method: "DELETE" });
      toast.success("Plan deleted successfully");
      fetchPlans();
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="p-4">
      <Toaster position="top-right" />

      <h1 className="text-2xl font-bold mb-4">Plans Management</h1>

      {/* Button to open Plan modal */}
      <button
        onClick={() => { setEditingPlan(null); setShowPlanModal(true); }}
        className="mb-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
      >
        Create Plan
      </button>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowPlanModal(false)}
            >
              ✕
            </button>
            <PlanForm
              plan={editingPlan}
              onSaved={() => {
                setShowPlanModal(false);
                fetchPlans();
                toast.success(`Plan ${editingPlan ? "updated" : "created"} successfully`);
              }}
            />
          </div>
        </div>
      )}

      {/* Plans List */}
      <ul>
        {plans.map((plan) => (
          <PlanItem
            key={plan.id}
            plan={plan}
            onEdit={(p) => { setEditingPlan(p); setShowPlanModal(true); }}
            onDelete={deletePlan}
            refreshPlans={fetchPlans}
          />
        ))}
      </ul>
    </div>
  );
}
