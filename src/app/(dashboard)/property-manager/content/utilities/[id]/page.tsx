// app/(dashboard)/property-manager/content/utilities/[id]/page.tsx
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

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "FIXED" as "FIXED" | "METERED",
    unitPrice: "",
    fixedAmount: "",
  });

  // Fetch utility and assignments
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch utility
      const utilRes = await fetch(`/api/utilities/${id}`);
      const utilData = await utilRes.json();
      
      console.log("Utility Response:", utilData);

      // Handle different response structures
      let utilityData = null;
      if (utilData?.success && utilData?.data) {
        utilityData = utilData.data;
      } else if (utilData?.id) {
        // Direct object without wrapper
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

      // Fetch leases
      const leaseRes = await fetch("/api/lease");
      const leaseData = await leaseRes.json();
      
      console.log("Lease Response:", leaseData);

      if (leaseData?.success && leaseData?.data) {
        setLeases(leaseData.data);
      } else if (Array.isArray(leaseData)) {
        setLeases(leaseData);
      }

      // Fetch lease utilities
      const leaseUtilRes = await fetch("/api/lease-utility");
      const leaseUtilData = await leaseUtilRes.json();
      
      console.log("Lease Utilities Response:", leaseUtilData);

      let assignedData = [];
      if (leaseUtilData?.success && leaseUtilData?.data) {
        assignedData = leaseUtilData.data;
      } else if (Array.isArray(leaseUtilData)) {
        assignedData = leaseUtilData;
      }

      // Filter assignments for this utility
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error || !utility) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-gray-500">{error || "Utility not found"}</p>
            <Link href="/property-manager/content/utilities">
              <Button variant="outline">
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
    <div className="p-6 space-y-6">
      <Toaster position="top-right" richColors />

      <div className="flex items-center gap-4">
        <Link href="/property-manager/content/utilities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Utilities
          </Button>
        </Link>
      </div>

      {/* Utility Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <span>{utility.name}</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                utility.type === "FIXED" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
              }`}>
                {utility.type === "FIXED" ? "Fixed" : "Metered"}
              </span>
            </CardTitle>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            // Edit Form
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Utility Name *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g., Electricity, Water, Gas"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Billing Type *</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(v: "FIXED" | "METERED") => 
                    setEditForm({ ...editForm, type: v, unitPrice: "", fixedAmount: "" })
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger id="edit-type">
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
                  <Label htmlFor="edit-unitPrice">Unit Price *</Label>
                  <Input
                    id="edit-unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.unitPrice}
                    onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })}
                    placeholder="e.g., 12.50"
                    disabled={isSaving}
                  />
                </div>
              )}

              {editForm.type === "FIXED" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-fixedAmount">Fixed Amount *</Label>
                  <Input
                    id="edit-fixedAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.fixedAmount}
                    onChange={(e) => setEditForm({ ...editForm, fixedAmount: e.target.value })}
                    placeholder="e.g., 50.00"
                    disabled={isSaving}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSaveEdit} disabled={isSaving}>
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
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Display Mode
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Unit Price</p>
                <p className="text-lg font-semibold">
                  {utility.type === "METERED" ? formatCurrency(utility.unitPrice) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fixed Amount</p>
                <p className="text-lg font-semibold">
                  {utility.type === "FIXED" ? formatCurrency(utility.fixedAmount) : "N/A"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Utility */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Assign Utility to Lease
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableLeases.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg space-y-3">
                <p className="text-gray-500">
                  {leases.length === 0
                    ? "No leases available. Create a lease first."
                    : "All leases already have this utility assigned."}
                </p>
                {leases.length === 0 && (
                  <Link href="/property-manager/content/lease/new">
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Lease
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lease-select">Select Lease</Label>
                  <Select value={selectedLease} onValueChange={setSelectedLease} disabled={isAssigning}>
                    <SelectTrigger id="lease-select">
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
                  <Label htmlFor="responsibility-select">Who Pays?</Label>
                  <Select value={responsibility} onValueChange={setResponsibility} disabled={isAssigning}>
                    <SelectTrigger id="responsibility-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Tenant</SelectItem>
                      <SelectItem value="false">Landlord</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleAssign} className="w-full" disabled={isAssigning}>
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
        <Card>
          <CardHeader>
            <CardTitle>Assigned Leases ({assigned.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {assigned.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-gray-500">No leases assigned yet.</p>
                <p className="text-sm text-gray-400">
                  Select a lease above to assign this utility.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Rent Amount</TableHead>
                      <TableHead>Responsibility</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assigned.map((a) => {
                      const lease = leases.find((l) => l.id === a.lease_id);
                      return (
                        <TableRow key={a.id}>
                          <TableCell>
                            {a.Lease?.unit?.unitNumber ?? a.Lease?.unit?.number ?? lease?.unit?.unitNumber ?? lease?.unit?.number ?? "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {a.Lease?.tenant?.firstName ?? a.Lease?.tenant?.name ?? lease?.tenant?.firstName ?? lease?.tenant?.name ?? "Unknown"}
                                {" "}
                                {a.Lease?.tenant?.lastName ?? lease?.tenant?.lastName ?? ""}
                              </span>
                              {(a.Lease?.tenant?.email || lease?.tenant?.email) && (
                                <span className="text-xs text-gray-500">
                                  {a.Lease?.tenant?.email ?? lease?.tenant?.email}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(a.Lease?.rentAmount ?? lease?.rentAmount)}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                a.is_tenant_responsible 
                                  ? "bg-purple-100 text-purple-800" 
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
  );
}