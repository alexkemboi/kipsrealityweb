
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Toaster, toast } from "sonner";
import { Loader2, Trash2, Edit2, Save, X, ArrowLeft, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";

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
  property?: { name: string };
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

export default function AssignUtilityPage() {
  const { id } = useParams();
  const router = useRouter();

  const [utility, setUtility] = useState<Utility | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [assigned, setAssigned] = useState<LeaseUtility[]>([]);
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
      
      console.log("Utility Response:", utilData);

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
      
      console.log("Lease Response:", leaseData);

      if (leaseData?.success && leaseData?.data) {
        setLeases(leaseData.data);
      } else if (Array.isArray(leaseData)) {
        setLeases(leaseData);
      }

      const leaseUtilRes = await fetch("/api/lease-utility");
      const leaseUtilData = await leaseUtilRes.json();
      
      console.log("Lease Utilities Response:", leaseUtilData);

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
      toast.error("Failed to load data");
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
      toast.error("Please enter a utility name");
      return;
    }

    if (editForm.type === "METERED" && (!editForm.unitPrice || parseFloat(editForm.unitPrice) <= 0)) {
      toast.error("Please enter a valid unit price for metered utilities");
      return;
    }

    if (editForm.type === "FIXED" && (!editForm.fixedAmount || parseFloat(editForm.fixedAmount) <= 0)) {
      toast.error("Please enter a valid fixed amount");
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
        toast.success("Utility updated successfully!");
        const updatedUtility = data.data || data;
        setUtility(updatedUtility);
        setIsEditing(false);
      } else {
        toast.error(data.error || "Failed to update utility");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("An error occurred while updating the utility");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedLease) {
      toast.error("Please select a lease");
      return;
    }

    const alreadyAssigned = assigned.some((a) => a.lease_id === selectedLease);
    if (alreadyAssigned) {
      toast.error("This utility is already assigned to the selected lease");
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
        toast.success("Utility assigned successfully!");
        const newAssignment = data.data || data;
        setAssigned((prev) => [...prev, newAssignment]);
        setSelectedLease("");
        setResponsibility("true");
      } else {
        toast.error(data.error || "Failed to assign utility");
      }
    } catch (err) {
      console.error("Assign error:", err);
      toast.error("An error occurred while assigning");
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
        toast.success("Assignment removed successfully");
        setAssigned((prev) => prev.filter((a) => a.id !== assignmentId));
      } else {
        toast.error(data.error || "Failed to unassign");
      }
    } catch (err) {
      console.error("Unassign error:", err);
      toast.error("Error while unassigning");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "KES" 
    }).format(amount);
  };

  const availableLeases = leases.filter((l) => !assigned.some((a) => a.lease_id === l.id));

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
        <Card className="max-w-2xl mx-auto border-slate-200 shadow-xl rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-[#15386a]/70">{error || "Utility not found"}</p>
            <Link href="/property-manager/content/utilities">
              <Button variant="outline" className="border-[#30D5C8] text-[#30D5C8] hover:bg-[#30D5C8]/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Utilities
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/property-manager/content/utilities">
            <Button variant="ghost" size="sm" className="text-[#15386a] hover:text-[#0b1f3a] hover:bg-[#30D5C8]/5">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Utilities
            </Button>
          </Link>
        </div>

        {/* Utility Info */}
        <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0b1f3a] to-[#15386a] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{utility.name}</CardTitle>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  utility.type === "FIXED" ? "bg-white/20 text-white" : "bg-[#30D5C8] text-[#0b1f3a]"
                }`}>
                  {utility.type === "FIXED" ? "Fixed" : "Metered"}
                </span>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEdit} className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isEditing ? (
              <div className="space-y-4 bg-gradient-to-br from-[#30D5C8]/5 to-[#15386a]/5 p-6 rounded-xl border-2 border-[#30D5C8]/20">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-[#0b1f3a] font-semibold">
                    Utility Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="e.g., Electricity, Water, Gas"
                    disabled={isSaving}
                    className="border-2 border-slate-200 focus:border-[#30D5C8] text-[#0b1f3a]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-type" className="text-[#0b1f3a] font-semibold">
                    Billing Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={editForm.type}
                    onValueChange={(v: "FIXED" | "METERED") => 
                      setEditForm({ ...editForm, type: v, unitPrice: "", fixedAmount: "" })
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger id="edit-type" className="border-2 border-slate-200 focus:border-[#30D5C8] text-[#0b1f3a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      <SelectItem value="METERED">Metered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editForm.type === "METERED" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-unitPrice" className="text-[#0b1f3a] font-semibold">
                      Unit Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-unitPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.unitPrice}
                      onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })}
                      placeholder="e.g., 12.50"
                      disabled={isSaving}
                      className="border-2 border-slate-200 focus:border-[#30D5C8] text-[#0b1f3a]"
                    />
                  </div>
                )}

                {editForm.type === "FIXED" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-fixedAmount" className="text-[#0b1f3a] font-semibold">
                      Fixed Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-fixedAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.fixedAmount}
                      onChange={(e) => setEditForm({ ...editForm, fixedAmount: e.target.value })}
                      placeholder="e.g., 50.00"
                      disabled={isSaving}
                      className="border-2 border-slate-200 focus:border-[#30D5C8] text-[#0b1f3a]"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSaveEdit} disabled={isSaving} className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-white shadow-lg shadow-[#30D5C8]/20">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving} className="border-2 border-slate-300 text-[#0b1f3a] hover:bg-slate-50">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
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
          </CardContent>
        </Card>

        {/* Assign Utility */}
        {!isEditing && (
          <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#30D5C8] to-[#30D5C8]/80 text-white">
              <CardTitle className="flex items-center text-xl">
                <Plus className="w-5 h-5 mr-2" />
                Assign Utility to Lease
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {availableLeases.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-[#30D5C8]/5 to-[#15386a]/5 rounded-xl space-y-3">
                  <p className="text-[#15386a]/70">
                    {leases.length === 0
                      ? "No leases available. Create a lease first."
                      : "All leases already have this utility assigned."}
                  </p>
                  {leases.length === 0 && (
                    <Link href="/property-manager/content/lease/new">
                      <Button variant="outline" size="sm" className="border-[#30D5C8] text-[#30D5C8] hover:bg-[#30D5C8]/5">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Lease
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="lease-select" className="text-[#0b1f3a] font-semibold">Select Lease</Label>
                    <Select value={selectedLease} onValueChange={setSelectedLease} disabled={isAssigning}>
                      <SelectTrigger id="lease-select" className="mt-2 border-2 border-slate-200 focus:border-[#30D5C8] text-[#0b1f3a]">
                        <SelectValue placeholder="Choose a lease" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLeases.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                Unit: {l.unit?.unitNumber ?? l.unit?.number ?? "N/A"}
                              </span>
                              <span className="text-xs text-gray-500">
                                Tenant: {l.tenant?.firstName ?? l.tenant?.name ?? "Unknown"} {l.tenant?.lastName ?? ""}
                              </span>
                              <span className="text-xs text-gray-500">
                                Rent: {formatCurrency(l.rentAmount)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="responsibility-select" className="text-[#0b1f3a] font-semibold">Who Pays?</Label>
                    <Select value={responsibility} onValueChange={setResponsibility} disabled={isAssigning}>
                      <SelectTrigger id="responsibility-select" className="mt-2 border-2 border-slate-200 focus:border-[#30D5C8] text-[#0b1f3a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Tenant</SelectItem>
                        <SelectItem value="false">Landlord</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={handleAssign} className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-white shadow-lg shadow-[#30D5C8]/20" disabled={isAssigning}>
                      {isAssigning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Assigning...
                        </>
                      ) : (
                        "Assign Utility"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Assigned Leases */}
        {!isEditing && (
          <Card className="border-slate-200 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#0b1f3a] to-[#15386a] text-white">
              <CardTitle className="text-xl">Assigned Leases ({assigned.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-[#0b1f3a]/10 hover:bg-transparent">
                        <TableHead className="text-[#0b1f3a] font-semibold">Unit</TableHead>
                        <TableHead className="text-[#0b1f3a] font-semibold">Tenant</TableHead>
                        <TableHead className="text-[#0b1f3a] font-semibold">Rent Amount</TableHead>
                        <TableHead className="text-[#0b1f3a] font-semibold">Responsibility</TableHead>
                        <TableHead className="text-right text-[#0b1f3a] font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assigned.map((a) => {
                        const lease = leases.find((l) => l.id === a.lease_id);
                        return (
                          <TableRow key={a.id} className="border-b border-slate-100 hover:bg-[#30D5C8]/5 transition-colors">
                            <TableCell className="text-[#0b1f3a]">
                              {a.Lease?.unit?.unitNumber ?? a.Lease?.unit?.number ?? lease?.unit?.unitNumber ?? lease?.unit?.number ?? "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-[#0b1f3a]">
                                  {a.Lease?.tenant?.firstName ?? a.Lease?.tenant?.name ?? lease?.tenant?.firstName ?? lease?.tenant?.name ?? "Unknown"}
                                  {" "}
                                  {a.Lease?.tenant?.lastName ?? lease?.tenant?.lastName ?? ""}
                                </span>
                                {(a.Lease?.tenant?.email || lease?.tenant?.email) && (
                                  <span className="text-xs text-[#15386a]/70">
                                    {a.Lease?.tenant?.email ?? lease?.tenant?.email}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-[#15386a]">{formatCurrency(a.Lease?.rentAmount ?? lease?.rentAmount)}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  a.is_tenant_responsible 
                                    ? "bg-[#30D5C8]/10 text-[#30D5C8]" 
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {a.is_tenant_responsible ? "Tenant" : "Landlord"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUnassign(a.id)}
                                disabled={deletingId === a.id}
                                title="Remove Assignment"
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                              >
                                {deletingId === a.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}