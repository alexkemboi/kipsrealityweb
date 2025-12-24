// components/lease/AmendmentManager.tsx
"use client";

import { useState, useEffect } from "react";
import {
  FileEdit,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
  ArrowRight,
  History,
} from "lucide-react";

interface Amendment {
  id: string;
  amendmentType: string;
  effectiveDate: string;
  description: string;
  changes: any;
  previousValues: any;
  status: string;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  executedBy?: string;
  executedAt?: string;
}

interface AmendmentManagerProps {
  leaseId: string;
}

export default function AmendmentManager({ leaseId }: AmendmentManagerProps) {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);

  const [amendmentForm, setAmendmentForm] = useState({
    amendmentType: "RENT_CHANGE",
    effectiveDate: "",
    description: "",
    changes: {} as any,
    requiresSignature: true,
  });

  useEffect(() => {
    fetchAmendments();
  }, [leaseId]);

 async function fetchAmendments() {
  try {
    const res = await fetch(`/api/lease/${leaseId}/ammendment`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error);
    }
    const data = await res.json();
    setAmendments(data);
  } catch (error) {
    console.error("Failed to fetch amendments:", error);
    setAmendments([]);
  } finally {
    setLoading(false);
  }
}


  async function createAmendment() {
    try {
      const res = await fetch(`/api/lease/${leaseId}/ammendment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(amendmentForm),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Amendment created successfully");
        setAmendments([data, ...amendments]);
        setShowCreateForm(false);
        resetForm();
      } else {
        alert(data.error || "Failed to create ammendment");
      }
    } catch (error) {
      console.error("Create amendment error:", error);
      alert("An error occurred");
    }
  }

  async function updateAmendmentStatus(
    amendmentId: string,
    action: "APPROVE" | "REJECT" | "EXECUTE"
  ) {
    const confirmMessages = {
      APPROVE: "Are you sure you want to approve this amendment?",
      REJECT: "Are you sure you want to reject this amendment?",
      EXECUTE: "This will apply the changes to the lease. Continue?",
    };

    if (!confirm(confirmMessages[action])) return;

    try {
      const res = await fetch(
        `/api/lease/${leaseId}/ammendment/${amendmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(`Amendment ${action.toLowerCase()}d successfully`);
        fetchAmendments();
      } else {
        alert(data.error || `Failed to ${action.toLowerCase()} amendment`);
      }
    } catch (error) {
      console.error("Update amendment error:", error);
      alert("An error occurred");
    }
  }

  async function deleteAmendment(amendmentId: string) {
    if (!confirm("Are you sure you want to delete this amendment?")) return;

    try {
      const res = await fetch(
        `/api/lease/${leaseId}/ammendment/${amendmentId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        alert("Amendment deleted");
        setAmendments(amendments.filter((a) => a.id !== amendmentId));
      } else {
        alert("Failed to delete amendment");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred");
    }
  }

  function resetForm() {
    setAmendmentForm({
      amendmentType: "RENT_CHANGE",
      effectiveDate: "",
      description: "",
      changes: {},
      requiresSignature: true,
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "EXECUTED":
        return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "EXECUTED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileEdit className="w-6 h-6 text-blue-600" />
          Lease Amendments
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Amendment
        </button>
      </div>

      {/* Create Amendment Form */}
      {showCreateForm && (
        <div className="mb-6 p-5 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h3 className="font-semibold mb-4 text-lg">Create New Amendment</h3>

          <div className="space-y-4">
            {/* Amendment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amendment Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={amendmentForm.amendmentType}
                onChange={(e) => {
                  setAmendmentForm({
                    ...amendmentForm,
                    amendmentType: e.target.value,
                    changes: {}, // Reset changes when type changes
                  });
                }}
              >
                <option value="RENT_CHANGE">Rent Change</option>
                <option value="TERM_EXTENSION">Term Extension</option>
                <option value="UTILITY_CHANGE">Utility Responsibility Change</option>
                <option value="RESPONSIBILITY_CHANGE">Responsibility Change</option>
                <option value="TENANT_CHANGE">Tenant Change</option>
                <option value="DEPOSIT_CHANGE">Deposit Change</option>
                <option value="FEE_STRUCTURE_CHANGE">Fee Structure Change</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={amendmentForm.effectiveDate}
                onChange={(e) =>
                  setAmendmentForm({
                    ...amendmentForm,
                    effectiveDate: e.target.value,
                  })
                }
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Describe the amendment..."
                value={amendmentForm.description}
                onChange={(e) =>
                  setAmendmentForm({
                    ...amendmentForm,
                    description: e.target.value,
                  })
                }
              />
            </div>

            {/* Dynamic fields based on amendment type */}
            <AmendmentFields
              amendmentType={amendmentForm.amendmentType}
              changes={amendmentForm.changes}
              onChange={(changes) =>
                setAmendmentForm({ ...amendmentForm, changes })
              }
            />

            {/* Requires Signature */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresSignature"
                checked={amendmentForm.requiresSignature}
                onChange={(e) =>
                  setAmendmentForm({
                    ...amendmentForm,
                    requiresSignature: e.target.checked,
                  })
                }
              />
              <label htmlFor="requiresSignature" className="text-sm text-gray-700">
                Requires new signatures from both parties
              </label>
            </div>

            {amendmentForm.requiresSignature && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  This amendment will reset all signatures. Both landlord and tenant
                  will need to re-sign the lease.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={createAmendment}
                disabled={
                  !amendmentForm.effectiveDate ||
                  !amendmentForm.description ||
                  Object.keys(amendmentForm.changes).length === 0
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Amendment
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amendments List */}
      {amendments.length === 0 ? (
        <div className="text-center py-12">
          <FileEdit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No amendments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {amendments.map((amendment) => (
            <div
              key={amendment.id}
              className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {amendment.amendmentType.replace(/_/g, " ")}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        amendment.status
                      )}`}
                    >
                      {getStatusIcon(amendment.status)}
                      {amendment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {amendment.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      Effective: {new Date(amendment.effectiveDate).toLocaleDateString()}
                    </span>
                    <span>
                      Created: {new Date(amendment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setSelectedAmendment(amendment)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {amendment.status === "PENDING" && (
                    <>
                      <button
                        onClick={() =>
                          updateAmendmentStatus(amendment.id, "APPROVE")
                        }
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          updateAmendmentStatus(amendment.id, "REJECT")
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAmendment(amendment.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {amendment.status === "APPROVED" && (
                    <button
                      onClick={() =>
                        updateAmendmentStatus(amendment.id, "EXECUTE")
                      }
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium flex items-center gap-1"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Execute
                    </button>
                  )}
                </div>
              </div>

              {/* Changes Preview */}
              {amendment.changes && Object.keys(amendment.changes).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Changes:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(amendment.changes).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Amendment Detail Modal */}
      {selectedAmendment && (
        <AmendmentDetailModal
          amendment={selectedAmendment}
          onClose={() => setSelectedAmendment(null)}
        />
      )}
    </div>
  );
}

// Dynamic Amendment Fields Component
function AmendmentFields({
  amendmentType,
  changes,
  onChange,
}: {
  amendmentType: string;
  changes: any;
  onChange: (changes: any) => void;
}) {
  const updateChange = (key: string, value: any) => {
    onChange({ ...changes, [key]: value });
  };

  switch (amendmentType) {
    case "RENT_CHANGE":
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Rent Amount
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              value={changes.rentAmount || ""}
              onChange={(e) =>
                updateChange("rentAmount", parseFloat(e.target.value))
              }
            />
          </div>
        </div>
      );

    case "TERM_EXTENSION":
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New End Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              value={changes.endDate || ""}
              onChange={(e) => updateChange("endDate", e.target.value)}
            />
          </div>
        </div>
      );

    case "UTILITY_CHANGE":
      return (
        <div className="space-y-2">
          {[
            ["tenantPaysElectric", "Electricity"],
            ["tenantPaysWater", "Water"],
            ["tenantPaysTrash", "Trash"],
            ["tenantPaysInternet", "Internet"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={changes[key] || false}
                onChange={(e) => updateChange(key, e.target.checked)}
              />
              <span className="text-sm">Tenant Pays {label}</span>
            </label>
          ))}
        </div>
      );

    case "DEPOSIT_CHANGE":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Security Deposit
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            value={changes.securityDeposit || ""}
            onChange={(e) =>
              updateChange("securityDeposit", parseFloat(e.target.value))
            }
          />
        </div>
      );

    default:
      return (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <p className="text-sm text-gray-600">
            Enter changes as JSON or specify them in the description above
          </p>
        </div>
      );
  }
}

// Amendment Detail Modal
function AmendmentDetailModal({
  amendment,
  onClose,
}: {
  amendment: Amendment;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Amendment Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold">
                {amendment.amendmentType.replace(/_/g, " ")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-semibold">{amendment.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Effective Date</p>
                <p className="font-semibold">
                  {new Date(amendment.effectiveDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{amendment.status}</p>
              </div>
            </div>

            {amendment.previousValues &&
              Object.keys(amendment.previousValues).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Previous Values
                  </p>
                  <div className="bg-gray-50 rounded p-3 space-y-1">
                    {Object.entries(amendment.previousValues).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {amendment.changes && Object.keys(amendment.changes).length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">New Values</p>
                <div className="bg-blue-50 rounded p-3 space-y-1">
                  {Object.entries(amendment.changes).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium text-blue-600">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}