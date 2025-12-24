"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Trash2, Edit2, Save, X, ArrowLeft, Plus, AlertCircle, Filter, Building2 } from "lucide-react";

interface Lease {
  id: string;
  rentAmount: number;
  tenant?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  unit?: {
    number?: string;
    unitNumber?: string;
    floor?: string;
  };
  property?: {
    id: string;
    name: string;
  };
  application?: { id: string };
}

interface LeaseUtility {
  id: string;
  lease_id: string;
  utility_id: string;
  is_tenant_responsible: boolean;
  Lease?: Lease;
  utility?: { name: string; type: "FIXED" | "METERED"; unitPrice?: number; fixedAmount?: number };
}

interface Utility {
  id: string;
  name: string;
  type: "FIXED" | "METERED";
  unitPrice?: number;
  fixedAmount?: number;
}

interface Property {
  id: string;
  name: string;
}

export default function AssignUtilityPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [utility, setUtility] = useState<Utility | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assigned, setAssigned] = useState<LeaseUtility[]>([]);

  const [selectedProperty, setSelectedProperty] = useState<string>(searchParams.get('property') || "all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedLease, setSelectedLease] = useState<string>("");
  const [responsibility, setResponsibility] = useState("true");

  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "FIXED" as "FIXED" | "METERED",
    unitPrice: "",
    fixedAmount: "",
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const utilRes = await fetch(`/api/utilities/${id}`);
      const utilData = await utilRes.json();

      let utilityData = null;
      if (utilData?.success && utilData?.data) {
        utilityData = utilData.data;
      } else if (utilData?.id) {
        utilityData = utilData;
      }

      if (utilityData) {
        setUtility(utilityData);
        setEditForm({
          name: utilityData.name || "",
          type: utilityData.type || "FIXED",
          unitPrice: utilityData.unitPrice?.toString() || "",
          fixedAmount: utilityData.fixedAmount?.toString() || "",
        });
      } else {
        setError("Utility not found");
        return;
      }

      const leaseRes = await fetch("/api/lease");
      const leaseData = await leaseRes.json();

      if (leaseData?.success && leaseData?.data) {
        setLeases(leaseData.data);
      } else if (Array.isArray(leaseData)) {
        setLeases(leaseData);
      }

      const propRes = await fetch("/api/propertymanager");
      const propData = await propRes.json();

      if (propData.success && propData.data) {
        setProperties(propData.data);
      } else if (Array.isArray(propData)) {
        setProperties(propData);
      }

      const leaseUtilRes = await fetch("/api/lease-utility");
      const leaseUtilData = await leaseUtilRes.json();

      let assignedData = [];
      if (leaseUtilData?.success && leaseUtilData?.data) {
        assignedData = leaseUtilData.data;
      } else if (Array.isArray(leaseUtilData)) {
        assignedData = leaseUtilData;
      }

      const filtered = assignedData.filter((a: LeaseUtility) => a.utility_id === id);
      setAssigned(filtered);

    } catch (err) {
      console.error("Load data error:", err);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (utility) {
      setEditForm({
        name: utility.name,
        type: utility.type,
        unitPrice: utility.unitPrice?.toString() || "",
        fixedAmount: utility.fixedAmount?.toString() || "",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      alert("Please enter a utility name");
      return;
    }

    if (editForm.type === "METERED" && (!editForm.unitPrice || parseFloat(editForm.unitPrice) <= 0)) {
      alert("Please enter a valid unit price for metered utilities");
      return;
    }

    if (editForm.type === "FIXED" && (!editForm.fixedAmount || parseFloat(editForm.fixedAmount) <= 0)) {
      alert("Please enter a valid fixed amount");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/utilities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          type: editForm.type,
          unitPrice: editForm.type === "METERED" ? parseFloat(editForm.unitPrice) : null,
          fixedAmount: editForm.type === "FIXED" ? parseFloat(editForm.fixedAmount) : null,
        }),
      });

      const data = await res.json();

      if (data.success || res.ok) {
        alert("Utility updated successfully!");
        const updatedUtility = data.data || data;
        setUtility(updatedUtility);
        setIsEditing(false);
      } else {
        alert(data.error || "Failed to update utility");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred while updating the utility");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedLease) {
      alert("Please select a lease");
      return;
    }

    const alreadyAssigned = assigned.some((a) => a.lease_id === selectedLease);
    if (alreadyAssigned) {
      alert("This utility is already assigned to the selected lease");
      return;
    }

    setIsAssigning(true);

    try {
      const res = await fetch("/api/lease-utility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lease_id: selectedLease,
          utility_id: id,
          is_tenant_responsible: responsibility === "true",
        }),
      });

      const data = await res.json();

      if (data.success || res.ok) {
        alert("Utility assigned successfully!");
        const newAssignment = data.data || data;
        setAssigned((prev) => [...prev, newAssignment]);
        setSelectedLease("");
        setResponsibility("true");
      } else {
        alert(data.error || "Failed to assign utility");
      }
    } catch (err) {
      console.error("Assign error:", err);
      alert("An error occurred while assigning");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    setDeletingId(assignmentId);

    try {
      const res = await fetch(`/api/lease-utility/${assignmentId}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.success || res.ok) {
        alert("Assignment removed successfully");
        setAssigned((prev) => prev.filter((a) => a.id !== assignmentId));
      } else {
        alert(data.error || "Failed to unassign");
      }
    } catch (err) {
      console.error("Unassign error:", err);
      alert("Error while unassigning");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  // Filter leases by property and unit
  const filteredLeases = leases.filter((l) => {
    const propertyMatch = selectedProperty === "all" || l.property?.id === selectedProperty;
    const unitMatch = selectedUnit === "all" || l.unit?.unitNumber === selectedUnit || l.unit?.number === selectedUnit;
    return propertyMatch && unitMatch;
  });

  const availableLeases = filteredLeases.filter((l) => !assigned.some((a) => a.lease_id === l.id));

  // Get unique units for the selected property
  const availableUnits = Array.from(
    new Set(
      filteredLeases
        .filter(l => selectedProperty === "all" || l.property?.id === selectedProperty)
        .map(l => l.unit?.unitNumber || l.unit?.number)
        .filter(Boolean)
    )
  );

  // Group assigned leases by property
  const assignedByProperty = assigned.reduce((acc, a) => {
    const lease = leases.find((l) => l.id === a.lease_id);
    const propertyId = a.Lease?.property?.id || lease?.property?.id || "unknown";
    const propertyName = a.Lease?.property?.name || lease?.property?.name || "Unknown Property";

    if (!acc[propertyId]) {
      acc[propertyId] = { name: propertyName, assignments: [] };
    }
    acc[propertyId].assignments.push({ ...a, lease });
    return acc;
  }, {} as Record<string, { name: string; assignments: Array<LeaseUtility & { lease?: Lease }> }>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#30D5C8]" />
        <span className="ml-3 text-[#15386a]">Loading...</span>
      </div>
    );
  }

  if (error || !utility) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto border border-slate-200 shadow-xl rounded-2xl bg-white">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-[#15386a]/70">{error || "Utility not found"}</p>
            <a href="/property-manager/content/utilities">
              <button className="px-4 py-2 border border-[#30D5C8] text-[#30D5C8] hover:bg-[#30D5C8]/5 rounded-lg flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Utilities
              </button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <a href="/property-manager/content/utilities">
            <button className="px-3 py-2 text-[#15386a] hover:text-[#0b1f3a] hover:bg-[#30D5C8]/5 rounded-lg flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Utilities
            </button>
          </a>
        </div>

        {/* Utility Info Card */}
        <div className="border border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-[#0b1f3a] to-[#15386a] text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{utility.name}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${utility.type === "FIXED" ? "bg-white/20 text-white" : "bg-[#30D5C8] text-[#0b1f3a]"
                  }`}>
                  {utility.type === "FIXED" ? "Fixed" : "Metered"}
                </span>
              </div>
              {!isEditing && (
                <button onClick={handleEdit} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {isEditing ? (
              <div className="space-y-4 bg-gradient-to-br from-[#30D5C8]/5 to-[#15386a]/5 p-6 rounded-xl border-2 border-[#30D5C8]/20">
                <div className="space-y-2">
                  <label className="text-[#0b1f3a] font-semibold block">
                    Utility Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g., Electricity, Water, Gas"
                    disabled={isSaving}
                    className="w-full px-3 py-2 border-2 border-slate-200 focus:border-[#30D5C8] rounded-lg text-[#0b1f3a] outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[#0b1f3a] font-semibold block">
                    Billing Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as "FIXED" | "METERED", unitPrice: "", fixedAmount: "" })}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border-2 border-slate-200 focus:border-[#30D5C8] rounded-lg text-[#0b1f3a] outline-none"
                  >
                    <option value="FIXED">Fixed Amount</option>
                    <option value="METERED">Metered</option>
                  </select>
                </div>

                {editForm.type === "METERED" && (
                  <div className="space-y-2">
                    <label className="text-[#0b1f3a] font-semibold block">
                      Unit Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.unitPrice}
                      onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })}
                      placeholder="e.g., 12.50"
                      disabled={isSaving}
                      className="w-full px-3 py-2 border-2 border-slate-200 focus:border-[#30D5C8] rounded-lg text-[#0b1f3a] outline-none"
                    />
                  </div>
                )}

                {editForm.type === "FIXED" && (
                  <div className="space-y-2">
                    <label className="text-[#0b1f3a] font-semibold block">
                      Fixed Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.fixedAmount}
                      onChange={(e) => setEditForm({ ...editForm, fixedAmount: e.target.value })}
                      placeholder="e.g., 50.00"
                      disabled={isSaving}
                      className="w-full px-3 py-2 border-2 border-slate-200 focus:border-[#30D5C8] rounded-lg text-[#0b1f3a] outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveEdit} disabled={isSaving} className="px-4 py-2 bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-white rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button onClick={handleCancelEdit} disabled={isSaving} className="px-4 py-2 border-2 border-slate-300 text-[#0b1f3a] hover:bg-slate-50 rounded-lg flex items-center gap-2 disabled:opacity-50">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#15386a]/5 to-[#15386a]/10 p-6 rounded-xl border border-[#15386a]/20">
                  <p className="text-sm text-[#15386a]/70 mb-2 font-medium">Unit Price</p>
                  <p className="text-2xl font-bold text-[#0b1f3a]">
                    {utility.type === "METERED" ? formatCurrency(utility.unitPrice) : "N/A"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-[#30D5C8]/5 to-[#30D5C8]/10 p-6 rounded-xl border border-[#30D5C8]/20">
                  <p className="text-sm text-[#15386a]/70 mb-2 font-medium">Fixed Amount</p>
                  <p className="text-2xl font-bold text-[#0b1f3a]">
                    {utility.type === "FIXED" ? formatCurrency(utility.fixedAmount) : "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters & Assign Utility Card */}
        {!isEditing && (
          <div className="border border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white">
            <div className="bg-gradient-to-r from-[#30D5C8] to-[#30D5C8]/80 text-white p-6">
              <h3 className="text-xl font-bold flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Assign Utility to Lease
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Filters */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-[#15386a]" />
                  <span className="font-semibold text-[#0b1f3a]">Filter Leases</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#0b1f3a] font-semibold block mb-2">Property</label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => {
                        setSelectedProperty(e.target.value);
                        setSelectedUnit("all");
                        setSelectedLease("");
                      }}
                      className="w-full px-3 py-2 border-2 border-slate-200 focus:border-[#30D5C8] rounded-lg text-[#0b1f3a] outline-none"
                    >
                      <option value="all">All Properties</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[#0b1f3a] font-semibold block mb-2">Unit</label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => {
                        setSelectedUnit(e.target.value);
                        setSelectedLease("");
                      }}
                      disabled={selectedProperty === "all"}
                      className="w-full px-3 py-2 border-2 border-slate-200 focus:border-[#30D5C8] rounded-lg text-[#0b1f3a] outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <option value="all">All Units</option>
                      {availableUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {(selectedProperty !== "all" || selectedUnit !== "all") && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProperty("all");
                        setSelectedUnit("all");
                        setSelectedLease("");
                      }}
                      className="px-3 py-1 text-sm text-[#15386a] border border-[#15386a]/30 hover:bg-[#15386a]/5 rounded-lg"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Assignment Form */}
              {availableLeases.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-[#30D5C8]/5 to-[#15386a]/5 rounded-xl space-y-3">
                  <p className="text-[#15386a]/70">
                    {leases.length === 0
                      ? "No leases available. Create a lease first."
                      : filteredLeases.length === 0
                        ? "No leases match the selected filters."
                        : "All filtered leases already have this utility assigned."}
                  </p>
                  {leases.length === 0 && (
                    <a href="/property-manager/content/lease/new">
                      <button className="px-4 py-2 border border-[#30D5C8] text-[#30D5C8] hover:bg-[#30D5C8]/5 rounded-lg flex items-center gap-2 mx-auto">
                        <Plus className="w-4 h-4" />
                        Create Lease
                      </button>
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[#0b1f3a] font-semibold block mb-2">Select Lease</label>
                    <select
                      value={selectedLease}
                      onChange={(e) => setSelectedLease(e.target.value)}
                      disabled={isAssigning}
                      className="w-full px-3 py-2 border-2 border-slate-200 focus:border-[#30D5C8] rounded-lg text-[#0b1f3a] outline-none"
                    >
                      <option value="">Choose a lease</option>
                      {availableLeases.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.property?.name || "Unknown"} - Unit {l.unit?.unitNumber ?? l.unit?.number ?? "N/A"} - {l.tenant?.firstName ?? l.tenant?.name ?? "Unknown"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[#0b1f3a] font-semibold block mb-2">Who Pays?</label>
                    <select
                      value={responsibility}
                      onChange={(e) => setResponsibility(e.target.value)}
                      disabled={isAssigning}
                      className="w-full px-3 py-2 border-2 border-slate-200 focus:border-[#30D5C8] rounded-lg text-[#0b1f3a] outline-none"
                    >
                      <option value="true">Tenant</option>
                      <option value="false">Landlord</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleAssign}
                      disabled={isAssigning}
                      className="w-full px-4 py-2 bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-white rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Assigning...
                        </>
                      ) : (
                        "Assign Utility"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assigned Leases - Grouped by Property */}
        {!isEditing && (
          <div className="border border-slate-200 shadow-xl rounded-2xl overflow-hidden bg-white">
            <div className="bg-gradient-to-r from-[#0b1f3a] to-[#15386a] text-white p-6">
              <h3 className="text-xl font-bold">Assigned Leases ({assigned.length})</h3>
            </div>

            <div className="p-6">
              {assigned.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-[#30D5C8]/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-[#30D5C8]" />
                  </div>
                  <p className="text-[#15386a]/70">No leases assigned yet.</p>
                  <p className="text-sm text-[#15386a]/50">
                    Select a lease above to assign this utility.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(assignedByProperty).map(([propertyId, { name: propertyName, assignments }]) => (
                    <div key={propertyId} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-[#15386a]/10 to-[#15386a]/5 px-4 py-3 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-[#15386a]" />
                          <h4 className="font-bold text-[#0b1f3a]">{propertyName}</h4>
                          <span className="ml-auto text-sm text-[#15386a]/70">
                            {assignments.length} {assignments.length === 1 ? 'lease' : 'leases'}
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                              <th className="text-left p-3 text-[#0b1f3a] font-semibold text-sm">Unit</th>
                              <th className="text-left p-3 text-[#0b1f3a] font-semibold text-sm">Tenant</th>
                              <th className="text-left p-3 text-[#0b1f3a] font-semibold text-sm">Rent Amount</th>
                              <th className="text-left p-3 text-[#0b1f3a] font-semibold text-sm">Responsibility</th>
                              <th className="text-right p-3 text-[#0b1f3a] font-semibold text-sm">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignments.map((a) => (
                              <tr key={a.id} className="border-b border-slate-100 hover:bg-[#30D5C8]/5 transition-colors">
                                <td className="p-3 text-[#0b1f3a]">
                                  {a.Lease?.unit?.unitNumber ?? a.Lease?.unit?.number ?? a.lease?.unit?.unitNumber ?? a.lease?.unit?.number ?? "N/A"}
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-col">
                                    <span className="text-[#0b1f3a]">
                                      {a.Lease?.tenant?.firstName ?? a.Lease?.tenant?.name ?? a.lease?.tenant?.firstName ?? a.lease?.tenant?.name ?? "Unknown"}
                                      {" "}
                                      {a.Lease?.tenant?.lastName ?? a.lease?.tenant?.lastName ?? ""}
                                    </span>
                                    {(a.Lease?.tenant?.email || a.lease?.tenant?.email) && (
                                      <span className="text-xs text-[#15386a]/70">
                                        {a.Lease?.tenant?.email ?? a.lease?.tenant?.email}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-[#15386a]">
                                  {formatCurrency(a.Lease?.rentAmount ?? a.lease?.rentAmount)}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${a.is_tenant_responsible
                                        ? "bg-[#30D5C8]/10 text-[#30D5C8]"
                                        : "bg-orange-100 text-orange-800"
                                      }`}
                                  >
                                    {a.is_tenant_responsible ? "Tenant" : "Landlord"}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleUnassign(a.id)}
                                    disabled={deletingId === a.id}
                                    title="Remove Assignment"
                                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg disabled:opacity-50"
                                  >
                                    {deletingId === a.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}